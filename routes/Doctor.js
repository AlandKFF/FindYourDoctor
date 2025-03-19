const express = require('express');
const router = express.Router();
const { Doctor, DoctorCertification, Hospital, DoctorHospital, Village, City, Country } = require('../models');

// GET routes
router.get('/', async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            include: [
            {
                model: DoctorCertification
            },
            {
                model: Hospital,
                through: DoctorHospital,
                include: {
                model: Village,
                include: {
                    model: City,
                    include: Country
                }
                }
            }
            ]
        });

        // Get unique locations for filter
        const locations = await Country.findAll({
            include: {
                model: City,
                include: {
                    model: Village,
                    include: {
                        model: Hospital,
                        include: {
                            model: Doctor
                        }
                    }
                }
            }
        });
        
        res.render('doctors/index', { doctors, locations, title:'Doctors' });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).render('doctors/index', { 
            doctors: [],
            locations: [],
            error: 'Failed to fetch doctors',
            title: 'Doctors'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                {
                    model: DoctorCertification
                },
                {
                    model: Hospital,
                    through: DoctorHospital,
                    include: [
                        {
                            model: Village,
                            include: {
                                model: City,
                                include: Country
                            }
                        }
                    ]
                }
            ]
        });

        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found', title:'' });
        }

        res.render('doctors/profile', { doctor, title: 'Doctor Profile' });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).render('error', { message: 'Error fetching doctor details',title:'' });
    }
});

module.exports = router;