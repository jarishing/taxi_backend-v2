const Template = require('./template.model'),
      errors = require('express-api-error');

const create = async( req, res, next ) => {

    const {} = req.body;

    try {
        let doc = new Template({});
        doc = await doc.save();
        return res.send({ data: doc });
    } catch( error ){
        console.error(error);
        return next( new errors.BadRequest() );
    };

};

const update = async( req, res, next ) => {

    const {} = req.body;

    try {
        let doc = req.template;
        doc = await doc.save();
        return res.send({ data: doc });
    } catch( error ){
        console.error(error);
        return next( new errors.BadRequest());
    };

};

const get = async( req, res, next ) => {

    try {
        let docs = await Template.find();
        return res.send({ data: docs });
    } catch( error ){
        console.error(error);
        return next( new errors.BadRequest());
    };
};

const remove = async( req, res, next ) => {

    try {
        let doc = req.template;
        doc = await doc.remove();
        return res.send({ data: doc });
    } catch( error ){
        console.error(error);
        return next( new errors.BadRequest());
    };

};

const getById = async( req, res, next ) => {

    try {
        let doc = req.template;
        return res.send({ data: doc });
    } catch( error ){
        console.error(error);
        return next( new errors.BadRequest());
    };

};

const load = async( req, res, next, templateId )=> {
    try {
        let template = await Template.findById(templateId);
        if ( !template )
            return next( new errors.BadRequest());
        req.template = template;
        return next();
    } catch( error ){
        console.log(error);
        return next( new errors.BadRequest() );
    };
};

const yetToImplement = ( req, res, next ) => {
    return next( new errors.NotImplemented() );
}

module.exports = {
    create : create,
    update : update,
    get    : get,
    getById: getById,
    remove : remove,
    load   : load
}