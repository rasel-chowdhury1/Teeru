

let adminData: {} | null = null;

export const setAdminData = (data: {}) => {
  adminData = data;
};

export const getAdminData = (): {} | null => {
  return adminData;
};


export const getAdminId = () => {
    return adminData?._id;
}