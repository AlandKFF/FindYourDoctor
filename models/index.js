const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
// const DB_password = process.env.DB_PASSWORD

const sequelize = new Sequelize(
  process.env.DB_NAME || "find_your_doctor",    // Database name
  process.env.DB_USER || "root",    // Username
  process.env.DB_PASSWORD || "(Aland&DB)", // Password
  {
    host: process.env.DB_HOST || 'localhost', // Hostname
    dialect: 'mysql',
    dialectOptions: {
      // Depending on InfinityFree, SSL may not be required:
      // ssl: { require: true, rejectUnauthorized: false }
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection to find_your_doctor database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// --- Geographic Data ---
const Country = sequelize.define('countries', {
    country_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

const City = sequelize.define('cities', {
    city_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    country_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Country,
            key: 'country_id'
        }
    }
}, { timestamps: false });

const Area = sequelize.define('areas', {
    area_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    city_id: {
        type: DataTypes.INTEGER,
        references: {
            model: City,
            key: 'city_id'
        }
    }
}, { timestamps: false });


// --- Hospital Data ---
const Hospital = sequelize.define('hospitals', {
    hospital_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    area_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Area,
            key: 'area_id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    summary: {
        type: DataTypes.TEXT
    },
    emergency_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    address: {
        type: DataTypes.STRING
    },
    contact_email: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    image_url: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('pending', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'pending'
    },
}, { timestamps: false });

const HospitalPhone = sequelize.define('hospital_phones', {
    Hospital_phone_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Hospital,
            key: 'hospital_id'
        }
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

const HospitalFacility = sequelize.define('hospital_facilities', {
    hospital_facility_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    facility_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Hospital,
            key: 'hospital_id'
        }
    },
}, { timestamps: false });

// --- Doctor Data ---
const Doctor = sequelize.define('doctors', {
    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING
    },
    bio: {
        type: DataTypes.TEXT
    },
    image_url: {
        type: DataTypes.STRING
    }
}, { timestamps: false });

const DoctorCertification = sequelize.define('doctor_certifications', {
    doctor_certification: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Doctor,
            key: 'doctor_id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    degree_level: {
        type: DataTypes.STRING,
        allowNull: false
    },
    awarding_institution: {
        type: DataTypes.STRING,
        allowNull: false
    },
    awarded_date: {
        type: DataTypes.DATE
    }
}, { timestamps: false });

const DoctorHospital = sequelize.define('doctor_hospitals', {
    doctor_hospital_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Doctor,
            key: 'doctor_id'
        }
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Hospital,
            key: 'hospital_id'
        }
    },
}, { timestamps: false });

// --- User Data ---
const User = sequelize.define('users', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('hospital manager', 'admin'),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'accept', 'reject'),
        allowNull: false,
        defaultValue: 'pending'
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
}, { timestamps: true });

// --- Hospital-User Relationship ---
const HospitalUser = sequelize.define('hospital_users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Hospital,
            key: 'hospital_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    request_message: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accept', 'reject'),
        allowNull: false,
        defaultValue: 'pending'
    },
    privacy_policy_agreement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    terms_of_service_agreement: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
}, { timestamps: false });

const ContactReports = sequelize.define('contact_reports', {
    report_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_info: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, { timestamps: false });

// --- Associations ---
HospitalUser.belongsTo(Hospital, { foreignKey: 'hospital_id' });
HospitalUser.belongsTo(User, { foreignKey: 'user_id' });

// Geographic associations
Country.hasMany(City, { foreignKey: 'country_id' });
City.belongsTo(Country, { foreignKey: 'country_id' });
City.hasMany(Area, { foreignKey: 'city_id' });
Area.belongsTo(City, { foreignKey: 'city_id' });

// Village to Hospital
Area.hasMany(Hospital, { foreignKey: 'area_id' });
Hospital.belongsTo(Area, { foreignKey: 'area_id' });

// Hospital associations
Hospital.hasMany(HospitalPhone, { foreignKey: 'hospital_id' });
HospitalPhone.belongsTo(Hospital, { foreignKey: 'hospital_id' });

// Doctor associations
Doctor.hasMany(DoctorCertification, { foreignKey: 'doctor_id' });
DoctorCertification.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Doctor and Hospital many-to-many with availability
Doctor.belongsToMany(Hospital, { through: DoctorHospital, foreignKey: 'doctor_id' });
Hospital.belongsToMany(Doctor, { through: DoctorHospital, foreignKey: 'hospital_id' });

// Association for HospitalFacility
Hospital.hasMany(HospitalFacility, { foreignKey: 'hospital_id' });
HospitalFacility.belongsTo(Hospital, { foreignKey: 'hospital_id' });

module.exports = {
    sequelize,
    Country,
    City,
    Area,
    Hospital,
    HospitalPhone,
    HospitalFacility,
    Doctor,
    DoctorCertification,
    DoctorHospital,
    User,
    HospitalUser,
    ContactReports
};