import {AccessControl} from 'accesscontrol'

const accessControlController = new AccessControl();

accessControlController.grant('basic')
    .updateOwn('profile')
    .deleteOwn('profile')
    .createOwn('profile')

accessControlController.grant('admin').extend('basic')

accessControlController.grant('admin')
    .readAny('profile')
    .updateAny('profile')

accessControlController.grant('super').extend('admin')

export const adminRoles = ['admin']

export const ACCESS_CONTROL_ERROR_MESSAGE = 'You dont have permission to perform this action';

export default accessControlController;