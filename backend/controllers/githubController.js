const axios = require('axios');
const { User, Consent, SkillEvidence, TechSkillScore, AuditLog } = require('../models');

/**
 * Ingest GitHub data for a user
 * 1. Checks public consent
 * 2. Fetches repos from GitHub
 * 3. Aggregates technologies, commits, and activity
 * 4. Replaces SkillEvidence and TechSkillScore
 * 5. Logs audit trail
 */
const ingestGitHubData = async (user) => {
  if (!user || !user.id) {
    throw new Error('User not provided for GitHub ingestion');
  }

  // 1. Check user has github_public consent
  const publicConsent = await Consent.findOne({
    where: {
      userId: user.id,
      source: 'github_public',
      revokedAt: null
    }
  });

  if (!publicConsent) {
    throw new Error('User has not granted active consent for github_public');
  }

  // Check if private repos are consented
  const privateConsent = await Consent.findOne({
    where: {
      userId: user.id,
      source: 'github_private',
      revokedAt: null
    }
  });

  const visibility = privateConsent ? 'all' : 'public';
  const token = user.githubAccessToken;

  let repos = [];
  try {
    const reposRes = await axios.get(
      `https://api.github.com/user/repos?per_page=100&sort=updated&type=owner&visibility=${visibility}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'SkillBridge-App',
          Accept: 'application/vnd.github.v3+json'
        },
        timeout: 10000
      }
    );
    repos = Array.isArray(reposRes.data) ? reposRes.data : [];
  } catch (apiError) {
    console.error('GitHub API error while fetching repos:', apiError.message);
    // If running in development/demo without internet or invalid mock token, provide fallback mock repos
    if (process.env.NODE_ENV !== 'production' && (!token || token.startsWith('demo'))) {
      repos = [
        {
          name: 'skillbridge-demo-repo',
          html_url: 'https://github.com/demo/skillbridge-demo-repo',
          language: 'JavaScript',
          pushed_at: new Date().toISOString(),
          owner: { login: user.githubUsername || 'demo-user' }
        },
        {
          name: 'python-data-pipeline',
          html_url: 'https://github.com/demo/python-data-pipeline',
          language: 'Python',
          pushed_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          owner: { login: user.githubUsername || 'demo-user' }
        }
      ];
    } else {
      throw new Error(`Failed to fetch repositories from GitHub: ${apiError.message}`);
    }
  }

  // 3. For each repo, extract languages & aggregate
  const techMap = {}; // { [tech]: { repoCount, commitCount, lastActivity, evidenceRefs: [] } }

  for (const repo of repos) {
    const languagesFound = new Set();
    if (repo.language) {
      languagesFound.add(repo.language);
    }

    // Try fetching detailed language breakdown for repo
    if (token && !token.startsWith('demo')) {
      try {
        const langRes = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Agent': 'SkillBridge-App'
            },
            timeout: 5000
          }
        );
        if (langRes.data && typeof langRes.data === 'object') {
          Object.keys(langRes.data).forEach(lang => languagesFound.add(lang));
        }
      } catch (err) {
        // Fall back to primary repo.language
      }
    }

    // Estimate or fetch commit count
    let commitCount = 5;
    if (token && !token.startsWith('demo')) {
      try {
        const commitsRes = await axios.get(
          `https://api.github.com/repos/${repo.owner.login}/${repo.name}/commits?per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'User-Agent': 'SkillBridge-App'
            },
            timeout: 5000
          }
        );
        if (Array.isArray(commitsRes.data)) {
          commitCount = commitsRes.data.length;
        }
      } catch (err) {
        commitCount = 5;
      }
    }

    const pushedAt = repo.pushed_at ? new Date(repo.pushed_at) : new Date();

    for (const tech of languagesFound) {
      if (!techMap[tech]) {
        techMap[tech] = {
          repoCount: 0,
          commitCount: 0,
          lastActivity: pushedAt,
          evidenceRefs: []
        };
      }

      techMap[tech].repoCount += 1;
      techMap[tech].commitCount += commitCount;
      if (pushedAt > techMap[tech].lastActivity) {
        techMap[tech].lastActivity = pushedAt;
      }
      techMap[tech].evidenceRefs.push({
        repoName: repo.name,
        repoUrl: repo.html_url,
        pushedAt: repo.pushed_at,
        commitsCount: commitCount
      });
    }
  }

  // 5. Delete old SkillEvidence and TechSkillScore for user
  if (SkillEvidence) {
    await SkillEvidence.destroy({ where: { userId: user.id } });
  }
  if (TechSkillScore) {
    await TechSkillScore.destroy({ where: { userId: user.id } });
  }

  const now = new Date();
  const createdScores = [];

  // 6 & 7. Create new SkillEvidence and compute TechSkillScore
  for (const [tech, data] of Object.entries(techMap)) {
    // Save SkillEvidence
    if (SkillEvidence) {
      await SkillEvidence.create({
        userId: user.id,
        technology: tech,
        evidenceRefs: data.evidenceRefs,
        source: 'github'
      });
    }

    // Formula: score = min(100, (repoCount * 10) + (commitCount * 0.5) + recencyBonus)
    const monthsAgo = (now.getTime() - data.lastActivity.getTime()) / (1000 * 60 * 60 * 24 * 30);
    let recencyBonus = 0;
    if (monthsAgo <= 3) {
      recencyBonus = 20;
    } else if (monthsAgo <= 6) {
      recencyBonus = 10;
    }

    const rawScore = (data.repoCount * 10) + (data.commitCount * 0.5) + recencyBonus;
    const finalScore = Math.min(100, Math.round(rawScore));

    let scoreRecord = null;
    if (TechSkillScore) {
      scoreRecord = await TechSkillScore.create({
        userId: user.id,
        technology: tech,
        score: finalScore,
        computedAt: now
      });
      createdScores.push(scoreRecord);
    }

    // 9. Create audit log entry for score computation
    if (AuditLog) {
      await AuditLog.create({
        actorId: user.id,
        action: 'SCORE_COMPUTED',
        entityType: 'TechSkillScore',
        entityId: scoreRecord ? scoreRecord.id : null,
        before: null,
        after: {
          technology: tech,
          score: finalScore,
          repoCount: data.repoCount,
          commitCount: data.commitCount,
          recencyBonus,
          formula: 'min(100, (repoCount * 10) + (commitCount * 0.5) + recencyBonus)'
        },
        reason: `Computed Technology Skill Score for ${tech} from verified GitHub evidence`,
        createdAt: now
      }).catch(err => console.error('Failed to log score computation:', err));
    }
  }

  return {
    technologiesProcessed: Object.keys(techMap).length,
    scores: createdScores
  };
};

/**
 * Redirect to GitHub OAuth
 */
const connect = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_REDIRECT_URI || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/github/callback`;
  const scope = 'read:user,repo:status,public_repo';

  if (!clientId) {
    return res.status(500).json({ error: 'GitHub Client ID is not configured' });
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  return res.redirect(githubAuthUrl);
};

/**
 * Handle GitHub OAuth callback
 */
const callback = async (req, res) => {
  try {
    const { code } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!code) {
      return res.redirect(`${frontendUrl}/profile?github_error=missing_code`);
    }

    if (!req.user) {
      return res.redirect(`${frontendUrl}/login?error=unauthenticated`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: 'application/json' },
        timeout: 10000
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      console.error('GitHub token exchange failure:', tokenResponse.data);
      return res.redirect(`${frontendUrl}/profile?github_error=token_exchange_failed`);
    }

    // Fetch GitHub User details
    const ghUserRes = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'SkillBridge-App'
      },
      timeout: 10000
    });

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=user_not_found`);
    }

    user.githubId = ghUserRes.data.id ? ghUserRes.data.id.toString() : null;
    user.githubUsername = ghUserRes.data.login || null;
    user.githubAccessToken = accessToken;
    await user.save();

    // Check if consent has been granted for github_public
    const publicConsent = await Consent.findOne({
      where: { userId: user.id, source: 'github_public', revokedAt: null }
    });

    if (publicConsent) {
      try {
        await ingestGitHubData(user);
      } catch (ingestErr) {
        console.error('Ingestion after OAuth callback warning:', ingestErr.message);
      }
    }

    return res.redirect(`${frontendUrl}/profile?github=connected`);
  } catch (error) {
    console.error('Error in GitHub callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/profile?github_error=server_error`);
  }
};

/**
 * Re-sync GitHub data on demand
 */
const sync = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: 'GitHub is not connected. Connect your account first.' });
    }

    const results = await ingestGitHubData(user);
    return res.json({
      message: 'GitHub data synced and skill scores updated successfully',
      results
    });
  } catch (error) {
    console.error('Error in GitHub sync:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync GitHub data' });
  }
};

/**
 * Check if GitHub is connected
 */
const getStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const publicConsent = await Consent.findOne({
      where: { userId: user.id, source: 'github_public', revokedAt: null }
    });

    const privateConsent = await Consent.findOne({
      where: { userId: user.id, source: 'github_private', revokedAt: null }
    });

    return res.json({
      connected: !!(user.githubId && user.githubAccessToken),
      githubId: user.githubId || null,
      githubUsername: user.githubUsername || null,
      hasPublicConsent: !!publicConsent,
      hasPrivateConsent: !!privateConsent
    });
  } catch (error) {
    console.error('Error in getStatus:', error);
    return res.status(500).json({ error: 'Failed to get GitHub status' });
  }
};

module.exports = {
  connect,
  callback,
  sync,
  getStatus,
  ingestGitHubData
};
