import config from '../config';
import { USER_ROLE } from '../modules/user/user.constants';
import { User } from '../modules/user/user.models';
import { setAdminData } from './adminStore';


const AdminUser = {
  fullName: 'Admin',
  email: config.admin_email,
  password: config.admin_password,
  phone: config.admin_phone,
  role: USER_ROLE.ADMIN,
  isDeleted: false,
  isActive: true,
};

const createDefaultAdmin = async () => {
  //when database is connected, we will check is there any user who is super admin
  const existingAdmin = await User.findOne({ role: USER_ROLE.ADMIN });

  if (!existingAdmin) {
    const result = await User.create(AdminUser);
    setAdminData(result); // store to memory
  } else {
    setAdminData(existingAdmin); // store to memory
  }
};

export default createDefaultAdmin;