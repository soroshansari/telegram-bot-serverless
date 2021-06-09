import { Composer, Markup, Scenes, session, Telegraf } from 'telegraf';
import makeHandler from 'lambda-request-handler';

const token = process.env.TELEGRAM_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const stepHandler = new Composer<Scenes.WizardContext>();
stepHandler.action('next', async (ctx) => {
  await ctx.reply('Step 2. Via inline button');
  return ctx.wizard.next();
});
stepHandler.command('next', async (ctx) => {
  await ctx.reply('Step 2. Via command');
  return ctx.wizard.next();
});
stepHandler.use((ctx) => ctx.replyWithMarkdown('Press `Next` button or type /next'));

const superWizard = new Scenes.WizardScene(
  'super-wizard',
  async (ctx) => {
    await ctx.reply(
      'Step 1',
      Markup.inlineKeyboard([
        Markup.button.url('❤️', 'http://telegraf.js.org'),
        Markup.button.callback('➡️ Next', 'next'),
      ])
    );
    return ctx.wizard.next();
  },
  stepHandler,
  async (ctx) => {
    await ctx.reply('Step 3');
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply('Step 4');
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply('Done');
    return await ctx.scene.leave();
  }
);

const bot = new Telegraf(token, {
  telegram: { webhookReply: true },
});

bot.start((ctx) => ctx.reply('Welcome to my awesome bot'));

const stage = new Scenes.Stage<Scenes.WizardContext>([superWizard], {
  default: 'super-wizard',
});
bot.use(session());
bot.use(stage.middleware());

export const handler = makeHandler(bot.webhookCallback(process.env.BOT_HOOK_PATH ?? '/'));
