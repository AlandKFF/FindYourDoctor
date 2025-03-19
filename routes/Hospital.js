const express = require('express');
const router = express.Router();
const { Hospital, Village, City, Country, Doctor, HospitalPhone, Facility, HospitalGallery } = require('../models');

// GET routes
router.get('/', async (req, res) => {
    try {
        const { name, location, service } = req.query;

        // Build the query dynamically based on filters
        const whereConditions = {};
        if (name) {
            whereConditions.name = { [Op.like]: `%${name}%` }; // Filter by name (case-insensitive)
        }

        const includeConditions = [
            {
                model: Village,
                include: {
                    model: City,
                    include: Country
                }
            },
            {
                model: Doctor,
                through: 'Doctor_Hospital'
            },
            {
                model: HospitalPhone
            },
            {
                model: Facility,
                through: 'Hospital_Facility'
            },
            {
                model: HospitalGallery
            }
        ];

        if (location) {
            includeConditions[0].include.where = { city_id: location }; // Filter by location
        }

        if (service) {
            includeConditions[3].where = { name: service }; // Filter by service
        }

        const hospitals = await Hospital.findAll({
            where: whereConditions,
            include: includeConditions
        });
        console.log(hospitals[1].dataValues.Hospital_Galleries);
        
        // Get unique locations for filter
        const locations = await Country.findAll({
            include: {
                model: City,
                include: Village
            }
        });
        
        res.render('hospitals/index', { hospitals, locations, query: req.query, title:'Hospitals' });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).render('hospitals/index', { 
            hospitals: [],
            locations: [],
            query: req.query,
            error: 'Failed to fetch hospitals',
            title:'Hospitals'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Village,
                    include: {
                        model: City,
                        include: Country
                    }
                },
                {
                    model: Doctor,
                    through: 'Doctor_Hospital'
                },
                {
                    model: HospitalPhone
                },
                {
                    model: Facility,
                    through: 'Hospital_Facility'
                },
                {
                    model: HospitalGallery
                }
            ]
        });

        if (!hospital) {
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        res.render('hospitals/profile', { hospital, title:'Hospitals' });
    } catch (error) {
        console.error('Error fetching hospital:', error);
        res.status(500).render('error', { message: 'Error fetching hospital details',title:'Hospitals' });
    }
});

module.exports = router;