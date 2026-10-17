const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Referral',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      alumnusId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      institutionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Institutions',
          key: 'id',
        },
      },
      company: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roleTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requiredTechnologies: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      slots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'expired'),
        defaultValue: 'open',
      },
      openToOtherColleges: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      recruiterEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      outcome: {
        type: DataTypes.ENUM('pending', 'successful', 'failed_screening', 'neutral'),
        defaultValue: 'pending',
      },
      outcomeReason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'Referrals',
      timestamps: true,
    }
  );
};
