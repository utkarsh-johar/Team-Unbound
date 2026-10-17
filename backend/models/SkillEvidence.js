const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'SkillEvidence',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      technology: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      evidenceRefs: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      source: {
        type: DataTypes.STRING,
        defaultValue: 'github',
      },
      commitCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      repoCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastActivity: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'SkillEvidences',
      timestamps: true,
    }
  );
};
