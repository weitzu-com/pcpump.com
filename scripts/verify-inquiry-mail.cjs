const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('/private/tmp/pcpump-v3-clean/node_modules/typescript');
function load(file, dependencies = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', code)(name => dependencies[name] || require(name), module, module.exports);
  return module.exports;
}
(async () => {
  delete process.env.INQUIRY_SMTP_USER;
  delete process.env.INQUIRY_SMTP_PASSWORD;
  const config = load('src/lib/inquiry-delivery-config.ts');
  assert.equal(config.smtpConfiguration(), null);
  process.env.INQUIRY_SMTP_USER = 'unrelated@example.invalid';
  process.env.INQUIRY_SMTP_PASSWORD = 'synthetic-test-password';
  assert.equal(config.smtpConfiguration(), null);
  process.env.INQUIRY_SMTP_USER = 'sales@pcpump.com';
  assert.equal(config.smtpConfiguration().port, 465);
  assert.equal(config.smtpConfiguration().secure, true);
  process.env.INQUIRY_SMTP_USER = 'other@cnps.net.cn';
  assert.equal(config.smtpConfiguration(), null);
  process.env.INQUIRY_SMTP_USER = 'other@pcpump.com';
  assert.equal(config.smtpConfiguration(), null);
  process.env.INQUIRY_SMTP_USER = 'kenny@cnps.net.cn';
  assert.equal(config.smtpConfiguration().auth.user, 'kenny@cnps.net.cn');
  let message, options, closed = 0, reject = false;
  const mail = load('src/lib/inquiry-mail.ts', {
    './inquiry-delivery-config': config,
    nodemailer: { createTransport: opts => { options = opts; return {
      sendMail: async value => { message = value; return { accepted: reject ? [] : ['sales@pcpump.com'] }; },
      close: () => closed++,
    }; } },
  });
  const inquiry = { reference: 'PCP-internal-synthetic-test', system: 'Surface-driven PCP', receivedAt: new Date().toISOString(), fields: { email: 'visitor@example.invalid', name: '<b>Visitor</b>', details: 'Synthetic local test; do not send.' }, selection: { pump: 'GLB120-27' } };
  assert.equal((await mail.sendEngineeringMail(inquiry)).status, 'accepted_by_mail_server');
  assert.equal(message.to, 'sales@pcpump.com');
  assert.equal(message.from.address, 'sales@pcpump.com');
  assert.equal(options.auth.user, 'kenny@cnps.net.cn');
  assert.equal(message.replyTo, 'visitor@example.invalid');
  assert.ok(message.text.includes('<b>Visitor</b>'));
  assert.equal(message.html, undefined);
  assert.deepEqual(JSON.parse(message.attachments[0].content), inquiry);
  assert.equal(options.disableFileAccess, true);
  assert.equal(options.disableUrlAccess, true);
  assert.equal(options.debug, false);
  reject = true;
  await assert.rejects(mail.sendEngineeringMail(inquiry));
  assert.equal(closed, 2);
  delete process.env.INQUIRY_SMTP_USER;
  delete process.env.INQUIRY_SMTP_PASSWORD;
  console.log('PASS: SMTP configuration, fixed recipient, Reply-To, full brief, rejection and transport cleanup. Synthetic test only; no external email sent.');
})().catch(error => { console.error(error); process.exitCode = 1; });
