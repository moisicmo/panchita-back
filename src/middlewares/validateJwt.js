const { response, request } = require('express');
const jwt = require('jsonwebtoken');

const validateJWT = async (req = request, res = response, next) => {
    const token = req.header('authorization');

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }


    try {
        const bearer = token.split(' ');
        const bearerToken = bearer[1];
        const { uid } = jwt.verify(
            bearerToken,
            process.env.JWT_SEED
        );

        req.uid = uid;
        next();

    } catch (error) {

        res.status(400).json({
            ok: false,
            msg: error.message
        })
    }
}

module.exports = {
    validateJWT
}


