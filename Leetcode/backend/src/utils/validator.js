
const validator=require('validator');


const validate=(data)=>{
 const mandatoryFields = ['firstName', 'emailId', 'password'];
 const IsAllowed=mandatoryFields.every((k)=>Object.keys(data).includes(k));
    if(!IsAllowed) throw new Error('Mandatory fields are missing');

    if(!validator.isEmail(data.emailId)){
        throw new Error('Invalid email format');
    }
    if(!validator.isStrongPassword(data.password)){
        throw new Error('Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter,special character and one number');
    }
    
}

module.exports= validate;