const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'ReferralCandidate',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      referralId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Referrals',
          key: 'id',
        },
      },
      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      matchScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      codeDnaScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      sandboxScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      fitScore: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      skippedReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('ranked', 'referred', 'rejected', 'withdrawn'),
        defaultValue: 'ranked',
      },
    },
    {
      tableName: 'ReferralCandidates',
      timestamps: true,
    }
  );
};
