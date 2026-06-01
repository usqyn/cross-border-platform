require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Intermediary = require('../models/Intermediary');
const Review = require('../models/Review');
const KnowledgeBase = require('../models/KnowledgeBase');
const Lead = require('../models/Lead');
const IntermediaryWallet = require('../models/IntermediaryWallet');
const Payment = require('../models/Payment');
const BorderStatus = require('../models/BorderStatus');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cross_border');
    await User.deleteMany({});
    await Intermediary.deleteMany({});
    await Review.deleteMany({});
    await KnowledgeBase.deleteMany({});
    await Lead.deleteMany({});
    await IntermediaryWallet.deleteMany({});
    await Payment.deleteMany({});
    await BorderStatus.deleteMany({});
    console.log('Cleaned existing data');
    const user1 = new User({
      openid: 'mock_user_1',
      nickname: '张先生',
      avatar: 'https://via.placeholder.com/100',
      isVerified: true
    });
    const user2 = new User({
      openid: 'mock_user_2',
      nickname: '李女士',
      avatar: 'https://via.placeholder.com/100',
      isVerified: true
    });
    const savedUsers = await User.insertMany([user1, user2]);
    console.log('Users created');
    const knowledge1 = new KnowledgeBase({
      title: {
        zh: '霍尔果斯口岸自驾游备案指南',
        ru: 'Руководство по регистрации для самостоятельных поездок через порт Хоргос',
        kk: 'Хоргос аспасында өзгеше сапарларды тіркеу нұсқауы'
      },
      content: {
        zh: '1. 准备材料：行驶证、驾驶证、身份证、车辆保险单\n2. 在霍尔果斯口岸办理车辆出境备案\n3. 缴纳相关费用\n4. 领取备案凭证',
        ru: '1. Подготовьте документы: водительское удостоверение, паспорт, страховка\n2. Зарегистрируйте выезд транспортного средства на порту Хоргос\n3. Оплатите необходимые сборы\n4. Получите сертификат регистрации',
        kk: '1. Құжаттарды дайындаңыз: жүктіктер куәлігі, паспорт, сақтандыру\n2. Хоргос портында көліктің шығу тіркелуін жүргізіңіз\n3. Қажетті төлемдерді төлеңіз\n4. Тіркеу сертификатын алыңыз'
      },
      category: 'vehicle',
      keywords: ['自驾', '备案', '霍尔果斯', '口岸'],
      source: '新疆出入境管理局'
    });
    const knowledge2 = new KnowledgeBase({
      title: {
        zh: '阿拉木图购房政策说明',
        ru: 'Описание политики покупки недвижимости в Алматы',
        kk: 'Алматыда бастығын сатып алу саясатының сипаттамасы'
      },
      content: {
        zh: '1. 外国人可在哈萨克斯坦购买房产\n2. 需要提供有效护照和签证\n3. 需在当地公证处办理手续\n4. 购房后可申请长期居留',
        ru: '1. Иностранцы могут купить недвижимость в Казахстане\n2. Требуется действующий паспорт и виза\n3. Необходимо оформить документы в местном нотариате\n4. После покупки можно подать заявление на долгосрочное проживание',
        kk: '1. Шетелшілер Қазақстанда бастығын сатып ала алады\n2. Жарамды паспорт және виза қажет\n3. Жергілікті нотариатта құжаттарды рәсімдеу қажет\n4. Сатып алғаннан кейін ұзақ мерзімді өмір сүру үшін өтінім беруге болады'
      },
      category: 'personal',
      keywords: ['阿拉木图', '购房', '买房', '签证'],
      source: '哈萨克斯坦房地产协会'
    });
    await KnowledgeBase.insertMany([knowledge1, knowledge2]);
    console.log('Knowledge base created');
    const inter1 = new Intermediary({
      name: {
        zh: '中亚跨境车服',
        ru: 'Центрально-Азиатская трансграничная служба автомобилей',
        kk: 'Орталық Азия шекаралық көлік қызметі'
      },
      logo: 'https://via.placeholder.com/150',
      category: 'vehicle_service',
      isCertified: true,
      membershipLevel: 'vip',
      rating: 4.9,
      reviewCount: 128,
      tags: ['自驾游', '口岸备案', '车辆保险'],
      description: {
        zh: '专业提供中哈跨境车辆服务，10年行业经验',
        ru: 'Профессиональные трансграничные автомобильные услуги между Китаем и Казахстаном, 10-летний опыт',
        kk: 'Қытай мен Қазақстан арасындағы шекаралық көлік қызметтерін ұсынамыз, 10 жылдық тәжірибе'
      },
      contact: { phone: '13800138000', wechat: 'zhongya_car' }
    });
    const inter2 = new Intermediary({
      name: {
        zh: '哈国签证中心',
        ru: 'Визовый центр Казахстана',
        kk: 'Қазақстан виза орталығы'
      },
      logo: 'https://via.placeholder.com/150',
      category: 'personal_service',
      isCertified: true,
      membershipLevel: 'premium',
      rating: 4.7,
      reviewCount: 86,
      tags: ['签证', '购房', '留学'],
      description: {
        zh: '一站式哈萨克斯坦签证、购房、留学咨询服务',
        ru: 'Комплексные услуги по визам, покупке недвижимости и обучению в Казахстане',
        kk: 'Қазақстанда виза, бастығын сатып алу және оқу үшін кешенді қызметтер'
      },
      contact: { phone: '13900139000', wechat: 'kaz_visa' }
    });
    const inter3 = new Intermediary({
      name: {
        zh: '丝路物流',
        ru: 'Шелковый путь логистика',
        kk: 'Жіпек жолы логистика'
      },
      logo: 'https://via.placeholder.com/150',
      category: 'logistics',
      isCertified: true,
      membershipLevel: 'vip',
      rating: 4.8,
      reviewCount: 156,
      tags: ['跨境物流', '货运', '清关'],
      description: {
        zh: '专业中哈跨境物流，快速清关',
        ru: 'Профессиональная трансграничная логистика между Китаем и Казахстаном, быстрая растаможка',
        kk: 'Қытай мен Қазақстан арасындағы шекаралық логистика, жылдам бөлмелеме'
      },
      contact: { phone: '13700137000', wechat: 'silk_logistics' }
    });
    const savedIntermediaries = await Intermediary.insertMany([inter1, inter2, inter3]);
    console.log('Intermediaries created');
    const review1 = new Review({
      userId: savedUsers[0]._id,
      intermediaryId: savedIntermediaries[0]._id,
      rating: 5,
      content: {
        zh: '服务非常专业，口岸备案很快就办好了！',
        ru: 'Очень профессиональный сервис, регистрация на порту прошла очень быстро!',
        kk: 'Өте кәсіби қызмет, портта тіркеу өте тез жүргізілді!'
      },
      isVerified: true
    });
    const review2 = new Review({
      userId: savedUsers[1]._id,
      intermediaryId: savedIntermediaries[0]._id,
      rating: 4,
      content: {
        zh: '整体不错，就是价格稍微贵了点',
        ru: 'В целом хорошо, просто цена немного высока',
        kk: 'Бәрімен жақсы, тек бағасы сәл қымбат'
      },
      isVerified: true
    });
    const review3 = new Review({
      userId: savedUsers[0]._id,
      intermediaryId: savedIntermediaries[1]._id,
      rating: 5,
      content: {
        zh: '签证办理速度很快，服务态度很好',
        ru: 'Визу оформили очень быстро, отличное обслуживание',
        kk: 'Визаны өте тез рәсімдеді, жақсы қызмет'
      },
      isVerified: true
    });
    await Review.insertMany([review1, review2, review3]);
    console.log('Reviews created');

    // Create Leads
    const lead1 = new Lead({
      user_id: savedUsers[0]._id,
      intermediary_id: null,
      service_type: 'vehicle',
      requirements: '需要自驾去阿拉木图，办理车辆出境备案',
      departure_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      contact_phone: '13800138001',
      contact_wechat: 'zhang_wechat',
      status: 'pending_unlock'
    });

    const lead2 = new Lead({
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[0]._id,
      service_type: 'vehicle',
      requirements: '车辆过境手续办理',
      departure_time: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      contact_phone: '13900139001',
      contact_wechat: 'li_wechat',
      status: 'unlocked'
    });

    const lead3 = new Lead({
      user_id: savedUsers[0]._id,
      intermediary_id: savedIntermediaries[1]._id,
      service_type: 'personal',
      requirements: '办理哈萨克斯坦旅游签证',
      departure_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      contact_phone: '13800138002',
      contact_wechat: 'zhang_tour',
      status: 'funds_escrowed',
      escrow_amount: 1500
    });

    const lead4 = new Lead({
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[1]._id,
      service_type: 'personal',
      requirements: '办理阿拉木图商务签证',
      departure_time: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      contact_phone: '13900139002',
      contact_wechat: 'li_business',
      status: 'refund_requested',
      escrow_amount: 2000,
      refund_request: {
        requested_amount: 2000,
        reason: '哈国政策变动，无法按时出行，需要全额退款',
        evidences: ['https://via.placeholder.com/400'],
        requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    const lead5 = new Lead({
      user_id: savedUsers[0]._id,
      intermediary_id: savedIntermediaries[0]._id,
      service_type: 'vehicle',
      requirements: '霍尔果斯口岸车辆通关服务',
      departure_time: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      contact_phone: '13800138003',
      contact_wechat: 'zhang_car',
      status: 'partial_refund_proposed',
      escrow_amount: 3000,
      refund_request: {
        requested_amount: 3000,
        reason: '口岸临时关闭，服务无法进行',
        evidences: ['https://via.placeholder.com/400'],
        requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      partial_refund_proposal: {
        proposed_amount: 2000,
        deduction_reason: '已产生材料准备成本，扣除1000元',
        proposed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    const lead6 = new Lead({
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[2]._id,
      service_type: 'logistics',
      requirements: '中哈跨境物流运输服务',
      departure_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      contact_phone: '13900139003',
      contact_wechat: 'li_logistics',
      status: 'dispute_reviewing',
      escrow_amount: 5000,
      refund_request: {
        requested_amount: 5000,
        reason: '货物损坏，要求全额退款',
        evidences: ['https://via.placeholder.com/400'],
        requested_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      dispute_deadline: new Date(Date.now() + 45 * 60 * 60 * 1000),
      dispute_logs: [
        {
          user_type: 'buyer',
          user_id: savedUsers[1]._id,
          message: '货物收到时严重损坏，有照片为证，要求全额退款',
          images: ['https://via.placeholder.com/400'],
          submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          user_type: 'seller',
          user_id: savedIntermediaries[2]._id,
          message: '货物运输前是完好的，有发货前照片为证，损坏可能发生在运输途中',
          images: ['https://via.placeholder.com/400'],
          submitted_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        }
      ]
    });

    const savedLeads = await Lead.insertMany([lead1, lead2, lead3, lead4, lead5, lead6]);
    console.log('Leads created');

    // Create Intermediary Wallets
    const wallet1 = new IntermediaryWallet({
      intermediary_id: savedIntermediaries[0]._id,
      points_balance: 150,
      membership_level: 'vip',
      available_balance: 5000,
      frozen_balance: 1500,
      total_earned: 25000
    });

    const wallet2 = new IntermediaryWallet({
      intermediary_id: savedIntermediaries[1]._id,
      points_balance: 80,
      membership_level: 'premium',
      available_balance: 3000,
      frozen_balance: 0,
      total_earned: 18000
    });

    const wallet3 = new IntermediaryWallet({
      intermediary_id: savedIntermediaries[2]._id,
      points_balance: 200,
      membership_level: 'vip',
      available_balance: 8000,
      frozen_balance: 2000,
      total_earned: 35000
    });

    await IntermediaryWallet.insertMany([wallet1, wallet2, wallet3]);
    console.log('Wallets created');

    // Create Payments
    const payment1 = new Payment({
      lead_id: savedLeads[2]._id,
      user_id: savedUsers[0]._id,
      intermediary_id: savedIntermediaries[1]._id,
      amount: 1500,
      platform_fee: 75,
      status: 'paid',
      payment_method: 'wechat',
      transaction_id: 'wx_transaction_001',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });

    const payment2 = new Payment({
      lead_id: null,
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[0]._id,
      amount: 2000,
      platform_fee: 100,
      status: 'settled',
      payment_method: 'wechat',
      transaction_id: 'wx_transaction_002',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
      settled_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    });

    const payment3 = new Payment({
      lead_id: savedLeads[3]._id,
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[1]._id,
      amount: 2000,
      platform_fee: 100,
      status: 'refund_requested',
      payment_method: 'wechat',
      transaction_id: 'wx_transaction_003',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    });

    const payment4 = new Payment({
      lead_id: savedLeads[4]._id,
      user_id: savedUsers[0]._id,
      intermediary_id: savedIntermediaries[0]._id,
      amount: 3000,
      platform_fee: 150,
      status: 'partial_refund_proposed',
      payment_method: 'wechat',
      transaction_id: 'wx_transaction_004',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    });

    const payment5 = new Payment({
      lead_id: savedLeads[5]._id,
      user_id: savedUsers[1]._id,
      intermediary_id: savedIntermediaries[2]._id,
      amount: 5000,
      platform_fee: 250,
      status: 'dispute_reviewing',
      payment_method: 'wechat',
      transaction_id: 'wx_transaction_005',
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      paid_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)
    });

    await Payment.insertMany([payment1, payment2, payment3, payment4, payment5]);
    console.log('Payments created');

    // Create Border Statuses
    const borderStatus1 = new BorderStatus({
      border_name: '霍尔果斯',
      status: '正常通关',
      estimated_wait_time: '2小时',
      announcement: {
        zh: '今日霍尔果斯口岸通关正常，建议提前准备好相关证件',
        ru: 'Сегодня порт Хоргос работает нормально, рекомендуем подготовить документы заранее',
        kk: 'Бүгін Хоргос портында күнделікті жұмыс жүргізілуде, құжаттарды алдын ала дайындауға ұсынамыз'
      },
      is_active: true,
      display_order: 1
    });

    const borderStatus2 = new BorderStatus({
      border_name: '阿拉山口',
      status: '排队中',
      estimated_wait_time: '3.5小时',
      announcement: {
        zh: '阿拉山口口岸今日车流量较大，请耐心等待',
        ru: 'Сегодня в порту Алашанькоу большой поток транспорта, пожалуйста, подождите',
        kk: 'Бүгін Алашанькоу портында көлік ағыны көп, күте отырыңыз'
      },
      is_active: true,
      display_order: 2
    });

    const borderStatus3 = new BorderStatus({
      border_name: '巴克图',
      status: '正常通关',
      estimated_wait_time: '无排队',
      announcement: {
        zh: '巴克图口岸今日通关顺畅',
        ru: 'Сегодня порт Бaktu работает顺畅',
        kk: 'Бүгін Бaktu портында ерекше күту керек емес'
      },
      is_active: true,
      display_order: 3
    });

    await BorderStatus.insertMany([borderStatus1, borderStatus2, borderStatus3]);
    console.log('Border statuses created');

    // Update intermediaries with credit score and weight score
    for (let i = 0; i < savedIntermediaries.length; i++) {
      const intermediary = savedIntermediaries[i];
      intermediary.credit_score = 100 - (i * 5);
      intermediary.weight_score = 95 - (i * 10);
      await intermediary.save();
    }
    console.log('Intermediary scores updated');

    console.log('Seed data completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
