const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Profile',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      college: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      branchProgram: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      graduationYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cgpa: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      careerIntent: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      summary: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Profiles',
      timestamps: true,
    }
  );
};
