const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'AlumniCredibility',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      alumnusId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      score: {
        type: DataTypes.FLOAT,
        defaultValue: 100,
      },
    },
    {
      tableName: 'AlumniCredibilities',
      timestamps: true,
    }
  );
};
