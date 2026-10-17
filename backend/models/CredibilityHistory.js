const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'CredibilityHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      alumniCredibilityId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'AlumniCredibilities',
          key: 'id',
        },
      },
      change: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      referralId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Referrals',
          key: 'id',
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'CredibilityHistories',
      timestamps: true,
      updatedAt: false,
    }
  );
};
