const express = require('express');
const router = express.Router();
const { Hospital, Doctor, HospitalPhone, HospitalFacility, Area, City, Country, DoctorCertification } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { summary: { [Op.like]: `%${search}%` } },
                    { address: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const hospitals = await Hospital.findAll({
            where: whereClause,
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    through: { attributes: [] }
                }
            ]
        });
        console.log(hospitals);
        res.render('hospitals/index', { hospitals, search });
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospitals' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        console.log('Fetching hospital with ID:', req.params.id);

        const hospital = await Hospital.findByPk(req.params.id, {
            include: [
                {
                    model: Area,
                    include: [
                        {
                            model: City,
                            include: [Country]
                        }
                    ]
                },
                {
                    model: HospitalPhone
                },
                {
                    model: HospitalFacility
                },
                {
                    model: Doctor,
                    include: [DoctorCertification],
                    through: { attributes: [] }
                }
            ]
        });

        console.log('Hospital fetched:', hospital);

        if (!hospital) {
            console.log('Hospital not found');
            return res.status(404).render('error', { message: 'Hospital not found' });
        }

        console.log('Rendering hospital profile');
        res.render('hospitals/profile', { hospital });
    } catch (error) {
        console.error('Error fetching hospital profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch hospital profile' });
    }
});

module.exports = router;