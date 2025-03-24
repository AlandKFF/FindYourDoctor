const express = require('express');
const router = express.Router();
const { Doctor, DoctorCertification, Hospital, Area, City, Country } = require('../models');
const { Op } = require('sequelize');

router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        
        if (search) {
            whereClause = {
                [Op.or]: [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { title: { [Op.like]: `%${search}%` } },
                    { bio: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const doctors = await Doctor.findAll({
            where: whereClause,
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution']
                },
                {
                    model: Hospital,
                    include: [{
                        model: Area,
                        include: [{
                            model: City,
                            include: [Country]
                        }]
                    }],
                    through: { attributes: [] }
                }
            ]
        });
        res.render('doctors/index', { doctors, search });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctors' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findByPk(req.params.id, {
            include: [
                {
                    model: DoctorCertification,
                    attributes: ['title', 'degree_level', 'awarding_institution', 'awarded_date']
                },
                {
                    model: Hospital,
                    through: { attributes: [] }
                }
            ]
        });
        
        if (!doctor) {
            return res.status(404).render('error', { message: 'Doctor not found' });
        }
        
        res.render('doctors/profile', { doctor });
    } catch (error) {
        console.error('Error fetching doctor profile:', error);
        res.status(500).render('error', { message: 'Failed to fetch doctor profile' });
    }
});

module.exports = router;