import {AccessControl} from 'accesscontrol'

const ac = new AccessControl();

ac.grant('basic')
    .updateOwn('profile')
    .deleteOwn('profile')
    .createOwn('profile')

ac.grant('admin').extend('basic')

ac.grant('admin')
    .readAny('profile')
    .updateAny('profile')

ac.grant('super').extend('admin')

export const adminRoles = ['admin']

export const ACCESS_CONTROL_ERROR_MESSAGE = 'You dont have permission to perform this action';

export default ac;