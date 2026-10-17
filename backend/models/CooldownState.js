const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'CooldownState',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      candidateId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      referralCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      cooldownUntil: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'CooldownStates',
      timestamps: true,
    }
  );
};
