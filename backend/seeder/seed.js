
require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../model');

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log('Kết nối DB thành công, bắt đầu seed...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const [admin] = await db.User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@yasuo.local',
        fullName: 'Quản trị viên',
        password: hashedPassword,
        gender: 'male',
        phoneNumber: '0901234567',
        role:'admin'
      },
    });

    console.log('Seed users xong:', admin.username);
    await db.Supplier.findOrCreate({
      where: { supplierName: 'Công ty TNHH Thương mại ABC' },
      defaults: {
        phone: '0901234567',
        address: '123 Lê Lợi, Q.1, TP.HCM',
      },
    });

    await db.Supplier.findOrCreate({
      where: { supplierName: 'Công ty CP Vật tư XYZ' },
      defaults: {
        phone: '0987654321',
        address: '45 Nguyễn Huệ, Q.1, TP.HCM',
      },
    });

    console.log('Seed suppliers xong');

    await db.Product.findOrCreate({
      where: { productsCode: 'SP001' },
      defaults: {
        productsName: 'Bút bi Thiên Long',
        unit: 'Cây',
        price: 5000,
        stock_quantity: 0,
      },
    });

    await db.Product.findOrCreate({
      where: { productsCode: 'SP002' },
      defaults: {
        productsName: 'Sổ tay A5',
        unit: 'Cuốn',
        price: 15000,
        stock_quantity: 0,
      },
    });
    console.log('Seed products xong');

  } catch (err) {
    console.error('Seed lỗi:', err);
  } finally {
    await db.sequelize.close();
  }
}

seed();