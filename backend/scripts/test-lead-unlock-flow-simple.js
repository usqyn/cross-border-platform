console.log('============================================');
console.log('   中哈跨境服务平台 - 线索解锁流程测试');
console.log('============================================\n');

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

class MockIntermediary {
  constructor(coins, vipLevel = 'normal', freeUnlockQuota = 0) {
    this.coins = coins;
    this.vipLevel = vipLevel;
    this.free_unlock_quota = freeUnlockQuota;
  }
}

class MockLead {
  constructor(status = 'pending_unlock', contactPhone = '13900139000') {
    this.status = status;
    this.contact_phone = contactPhone;
  }
}

function unlockLead(lead, intermediary) {
  const UNLOCK_COST = 20;
  let coinsDeducted = UNLOCK_COST;
  let usedFreeQuota = false;

  if (!lead) {
    return { success: false, error: '线索不存在' };
  }

  if (lead.status !== 'pending_unlock') {
    return { success: false, error: '线索已被解锁' };
  }

  if (!intermediary) {
    return { success: false, error: '中介不存在' };
  }

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

  lead.status = 'unlocked';

  return { 
    success: true, 
    data: {
      contact: {
        phone: lead.contact_phone
      },
      transaction: {
        coins_deducted: coinsDeducted,
        remaining_coins: intermediary.coins,
        used_free_quota: usedFreeQuota,
        free_quota_remaining: intermediary.free_unlock_quota
      }
    }
  };
}

console.log('🔓 测试流程: 线索积分解锁流');
console.log('--------------------------------------------');

const userPhone = '13900139000';

const lead = new MockLead('pending_unlock', userPhone);
addTestResult('T1-生成待解锁线索', true, `线索状态: ${lead.status}, 隐藏手机号: ${userPhone}`);

const intermediary = new MockIntermediary(0, 'normal');
addTestResult('T2-创建积分为0的普通中介', true, `初始积分: ${intermediary.coins}`);

const unlockResult1 = unlockLead(lead, intermediary);
const expectedError = '您的账户积分不足，请联系平台客服微信充值';
const isBlocked = unlockResult1.success === false && unlockResult1.error === expectedError;
addTestResult('T3-积分不足时拦截解锁', isBlocked, 
  isBlocked ? `正确拦截: ${unlockResult1.error}` : `失败: 期望拦截但返回: ${JSON.stringify(unlockResult1)}`);

intermediary.coins = 100;
addTestResult('T4-后台充值积分', intermediary.coins === 100, `充值后积分: ${intermediary.coins}`);

const newLead = new MockLead('pending_unlock', userPhone);
const unlockResult2 = unlockLead(newLead, intermediary);
const isSuccess = unlockResult2.success === true && 
                 unlockResult2.data && 
                 unlockResult2.data.contact && 
                 unlockResult2.data.contact.phone;
addTestResult('T5-积分充足时成功解锁', isSuccess, 
  isSuccess ? `成功返回联系方式: ${unlockResult2.data.contact.phone}` : `失败: ${JSON.stringify(unlockResult2)}`);

const expectedCoins = 100 - 20;
const coinsCorrect = intermediary.coins === expectedCoins;
addTestResult('T6-积分正确扣减', coinsCorrect, 
  `扣减后积分: ${intermediary.coins} (期望: ${expectedCoins})`);

const statusCorrect = newLead.status === 'unlocked';
addTestResult('T7-线索状态变更为已解锁', statusCorrect, `线索状态: ${newLead.status}`);

const contactPhoneCorrect = unlockResult2.data.contact.phone === userPhone;
addTestResult('T8-成功返回真实手机号', contactPhoneCorrect, 
  `返回电话: ${unlockResult2.data.contact.phone}`);

console.log('\n👑 测试流程: VIP会员折扣');
console.log('--------------------------------------------');

const vipIntermediary = new MockIntermediary(50, 'vip', 2);
addTestResult('T9-创建VIP中介(含免费额度)', true, `初始积分: ${vipIntermediary.coins}, 免费额度: ${vipIntermediary.free_unlock_quota}`);

const vipLead1 = new MockLead('pending_unlock', '13800138000');
const vipUnlock1 = unlockLead(vipLead1, vipIntermediary);
addTestResult('T10-VIP使用免费额度解锁', vipUnlock1.success && vipUnlock1.data.transaction.used_free_quota, 
  `使用免费额度: ${vipUnlock1.data.transaction.used_free_quota}, 剩余额度: ${vipUnlock1.data.transaction.free_quota_remaining}`);

const vipLead2 = new MockLead('pending_unlock', '13700137000');
const vipUnlock2 = unlockLead(vipLead2, vipIntermediary);
addTestResult('T11-VIP第二次使用免费额度', vipUnlock2.success && vipUnlock2.data.transaction.used_free_quota, 
  `使用免费额度: ${vipUnlock2.data.transaction.used_free_quota}, 剩余额度: ${vipUnlock2.data.transaction.free_quota_remaining}`);

const vipLead3 = new MockLead('pending_unlock', '13600136000');
const vipUnlock3 = unlockLead(vipLead3, vipIntermediary);
addTestResult('T12-VIP额度用尽后享受5折', vipUnlock3.success && vipUnlock3.data.transaction.coins_deducted === 10, 
  `扣减积分: ${vipUnlock3.data.transaction.coins_deducted} (5折优惠)`);

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