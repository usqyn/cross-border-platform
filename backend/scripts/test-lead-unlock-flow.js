const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Intermediary = require('../models/Intermediary');
const Lead = require('../models/Lead');

mongoose.set('strictQuery', false);

const LEAD_UNLOCK_COST = 20;

let testResults = [];

function addTestResult(testName, passed, message) {
  testResults.push({
    name: testName,
    passed,
    message
  });
  
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (message) {
    console.log(`   ${message}`);
  }
}

async function runTests() {
  console.log('============================================');
  console.log('   中哈跨境服务平台 - 线索解锁流程测试');
  console.log('============================================\n');

  let user, intermediary, lead;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ 数据库连接成功\n');

    console.log('🔓 测试流程: 线索积分解锁流');
    console.log('--------------------------------------------');

    user = await User.create({
      nickname: '测试用户',
      phone: '13900139000',
      wechat: 'test_user_wx',
      language: 'zh'
    });
    addTestResult('T1-创建测试用户', true, `用户ID: ${user._id}`);

    intermediary = await Intermediary.create({
      name: { zh: '测试中介', ru: 'Тестовый посредник', kk: 'Сынап араласушы' },
      category: 'personal_service',
      coins: 0,
      vipLevel: 'normal',
      membershipLevel: 'basic'
    });
    addTestResult('T2-创建积分为0的普通中介', true, `中介ID: ${intermediary._id}, 初始积分: ${intermediary.coins}`);

    lead = await Lead.create({
      user_id: user._id,
      intermediary_id: intermediary._id,
      service_type: 'personal',
      requirements: '测试签证咨询需求',
      departure_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      contact_phone: '13900139000',
      contact_wechat: 'test_contact_wx',
      status: 'pending_unlock'
    });
    addTestResult('T3-生成待解锁线索', true, `线索ID: ${lead._id}, 状态: ${lead.status}`);

    const unlockResult1 = await simulateUnlockLead(lead._id, intermediary._id);
    const expectedError = '您的账户积分不足，请联系平台客服微信充值';
    const isBlocked = unlockResult1.success === false && 
                     unlockResult1.error === expectedError;
    addTestResult('T4-积分不足时拦截解锁', isBlocked, 
      isBlocked ? `正确拦截: ${unlockResult1.error}` : `失败: 期望拦截但返回: ${JSON.stringify(unlockResult1)}`);

    await Intermediary.findByIdAndUpdate(intermediary._id, { coins: 100 });
    const updatedIntermediary = await Intermediary.findById(intermediary._id);
    addTestResult('T5-后台充值积分', updatedIntermediary.coins === 100, 
      `充值后积分: ${updatedIntermediary.coins}`);

    const unlockResult2 = await simulateUnlockLead(lead._id, intermediary._id);
    const isSuccess = unlockResult2.success === true && 
                     unlockResult2.data && 
                     unlockResult2.data.contact && 
                     unlockResult2.data.contact.phone;
    addTestResult('T6-积分充足时成功解锁', isSuccess, 
      isSuccess ? `成功返回联系方式: ${unlockResult2.data.contact.phone}` : `失败: ${JSON.stringify(unlockResult2)}`);

    const finalIntermediary = await Intermediary.findById(intermediary._id);
    const expectedCoins = 100 - LEAD_UNLOCK_COST;
    const coinsCorrect = finalIntermediary.coins === expectedCoins;
    addTestResult('T7-积分正确扣减', coinsCorrect, 
      `扣减后积分: ${finalIntermediary.coins} (期望: ${expectedCoins})`);

    const finalLead = await Lead.findById(lead._id);
    const statusCorrect = finalLead.status === 'unlocked';
    addTestResult('T8-线索状态变更为已解锁', statusCorrect, 
      `线索状态: ${finalLead.status}`);

    const contactPhoneCorrect = unlockResult2.data.contact.phone === lead.contact_phone;
    addTestResult('T9-成功返回真实手机号', contactPhoneCorrect, 
      `返回电话: ${unlockResult2.data.contact.phone}`);

  } catch (error) {
    addTestResult('测试异常', false, `错误: ${error.message}`);
    console.error('测试执行错误:', error);
  } finally {
    if (user) await User.findByIdAndDelete(user._id);
    if (intermediary) await Intermediary.findByIdAndDelete(intermediary._id);
    if (lead) await Lead.findByIdAndDelete(lead._id);
    
    await mongoose.disconnect();
  }

  console.log('\n============================================');
  console.log('   测试完成 - 最终报告');
  console.log('============================================');
  
  const passed = testResults.filter(r => r.passed).length;
  const total = testResults.length;
  const rate = ((passed / total) * 100).toFixed(1);
  
  console.log(`\n总测试数: ${total}`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${total - passed}`);
  console.log(`通过率: ${rate}%\n`);

  if (passed === total) {
    console.log('🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('❌ 部分测试失败，请检查代码逻辑');
    process.exit(1);
  }
}

async function simulateUnlockLead(leadId, intermediaryId) {
  try {
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return { success: false, error: '线索不存在' };
    }

    if (lead.status !== 'pending_unlock') {
      return { success: false, error: '线索已被解锁' };
    }

    const intermediary = await Intermediary.findById(intermediaryId);
    if (!intermediary) {
      return { success: false, error: '中介不存在' };
    }

    const UNLOCK_COST = 20;
    let coinsDeducted = UNLOCK_COST;
    let usedFreeQuota = false;

    if (intermediary.vipLevel === 'vip') {
      if (intermediary.free_unlock_quota > 0) {
        intermediary.free_unlock_quota -= 1;
        coinsDeducted = 0;
        usedFreeQuota = true;
      } else {
        coinsDeducted = Math.floor(UNLOCK_COST * 0.5);
      }
    }

    if (!usedFreeQuota) {
      if (intermediary.coins < coinsDeducted) {
        return { 
          success: false, 
          error: '您的账户积分不足，请联系平台客服微信充值',
          current_coins: intermediary.coins,
          required_coins: coinsDeducted
        };
      }
      intermediary.coins -= coinsDeducted;
    }

    await intermediary.save();

    lead.intermediary_id = intermediaryId;
    lead.status = 'unlocked';
    lead.updated_at = new Date();
    await lead.save();

    return { 
      success: true, 
      data: {
        lead,
        contact: {
          phone: lead.contact_phone,
          wechat: lead.contact_wechat,
          user_name: '测试用户'
        },
        transaction: {
          coins_deducted: coinsDeducted,
          remaining_coins: intermediary.coins,
          used_free_quota: usedFreeQuota,
          free_quota_remaining: intermediary.free_unlock_quota
        }
      }
    };
  } catch (error) {
    return { success: false, error: '服务器错误' };
  }
}

runTests();