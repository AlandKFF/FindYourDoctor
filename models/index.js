const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
const DB_password = process.env.DB_PASSWORD;

const sequelize = new Sequelize('find_your_doctor', 'root', DB_password, {
    host: 'localhost',
    dialect: 'mysql' 
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection to find_your_doctor database has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// --- Geographic Hierarchy ---

const Country = sequelize.define('Country', {
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

const City = sequelize.define('City', {
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

const Village = sequelize.define('Village', {
    village_id: {
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

const Hospital = sequelize.define('Hospital', {
    hospital_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    village_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Village,
            key: 'village_id'
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
    parking_availability: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    open_at: {
        type: DataTypes.TIME
    },
    close_at: {
        type: DataTypes.TIME
    }
}, { timestamps: false });

const HospitalPhone = sequelize.define('Hospital_Phone', {
    phone_id: {
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

const HospitalGallery = sequelize.define('Hospital_Gallery', {
    gallery_id: {
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
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

const Facility = sequelize.define('Facility', {
    facility_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });

const HospitalFacility = sequelize.define('Hospital_Facility', {
    hospital_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Hospital,
            key: 'hospital_id'
        }
    },
    facility_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: Facility,
            key: 'facility_id'
        }
    }
}, { timestamps: false });

// --- Doctor Data ---

const Doctor = sequelize.define('Doctor', {
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
    year_starting_work: {
        type: DataTypes.INTEGER
    },
    image_url: {
        type: DataTypes.STRING
    }
}, { timestamps: false });

const DoctorCertification = sequelize.define('Doctor_Certification', {
    certification_id: {
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
    certification_name: {
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

const DoctorHospital = sequelize.define('Doctor_Hospital', {
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
    available_from: {
        type: DataTypes.TIME
    },
    available_until: {
        type: DataTypes.TIME
    }
}, { timestamps: false });

// --- Associations ---

// Geographic associations
Country.hasMany(City, { foreignKey: 'country_id' });
City.belongsTo(Country, { foreignKey: 'country_id' });
City.hasMany(Village, { foreignKey: 'city_id' });
Village.belongsTo(City, { foreignKey: 'city_id' });

// Village to Hospital
Village.hasMany(Hospital, { foreignKey: 'village_id' });
Hospital.belongsTo(Village, { foreignKey: 'village_id' });

// Hospital associations
Hospital.hasMany(HospitalPhone, { foreignKey: 'hospital_id' });
HospitalPhone.belongsTo(Hospital, { foreignKey: 'hospital_id' });

Hospital.hasMany(HospitalGallery, { foreignKey: 'hospital_id' });
HospitalGallery.belongsTo(Hospital, { foreignKey: 'hospital_id' });

// Hospital and Facility many-to-many
Hospital.belongsToMany(Facility, { through: HospitalFacility, foreignKey: 'hospital_id' });
Facility.belongsToMany(Hospital, { through: HospitalFacility, foreignKey: 'facility_id' });

// Doctor associations
Doctor.hasMany(DoctorCertification, { foreignKey: 'doctor_id' });
DoctorCertification.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Doctor and Hospital many-to-many with availability
Doctor.belongsToMany(Hospital, { through: DoctorHospital, foreignKey: 'doctor_id' });
Hospital.belongsToMany(Doctor, { through: DoctorHospital, foreignKey: 'hospital_id' });

module.exports = {
    sequelize,
    Country,
    City,
    Village,
    Hospital,
    HospitalPhone,
    HospitalGallery,
    Facility,
    HospitalFacility,
    Doctor,
    DoctorCertification,
    DoctorHospital
};