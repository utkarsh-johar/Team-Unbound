const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'RecruiterInvite',
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'RecruiterInvites',
      timestamps: true,
    }
  );
};
