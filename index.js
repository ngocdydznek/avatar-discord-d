const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Events
} = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`✅ Bot đã đăng nhập với tên ${client.user.tag}`);

  const customStatuses = [
    'lệnh !av',
    'nhìn cái đéo gì',
    'Vũ Hà from 36 with love',
    'hẹ hẹ hẹ'
  ];

  let index = 0;
  setInterval(() => {
    client.user.setPresence({
      activities: [{
        name: customStatuses[index],
        type: 4 // type 4 = Custom Status
      }],
      status: 'online'
    });
    index = (index + 1) % customStatuses.length;
  }, 4000); // đổi mỗi 4 giây
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args[0].toLowerCase();
  const aliases = ['!av', '!avt', '!avatar'];
  if (!aliases.includes(command)) return;

  let userId;
  if (message.mentions.users.size > 0) {
    userId = message.mentions.users.first().id;
  } else if (args[1]) {
    userId = args[1];
  } else {
    return message.reply('⚠️ Vui lòng tag hoặc nhập ID người dùng.');
  }

  try {
    const user = await client.users.fetch(userId);
    const globalAvatar = user.displayAvatarURL({ dynamic: true, size: 4096 });

    let member = null;
    try {
      member = await message.guild.members.fetch(userId);
    } catch {}

    const serverAvatar = member?.avatarURL({ dynamic: true, size: 4096 });

    // Info thêm
    const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`;
    const joinedAt = member?.joinedAt
      ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
      : 'Không có dữ liệu (không trong server)';
    const isBot = user.bot ? '✅ Có' : '❌ Không';

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar của ${user.username}`)
      .setDescription(`**ID:** ${user.id}`)
      .addFields(
        { name: '🌐 Avatar Toàn Cục', value: `[Xem ảnh](${globalAvatar})`, inline: false },
        {
          name: '🛡️ Avatar Trong Server',
          value: serverAvatar ? `[Xem ảnh](${serverAvatar})` : 'Không có avatar riêng trong server',
          inline: false
        },
        { name: '📅 Tài khoản tạo lúc', value: createdAt, inline: true },
        { name: '⏱️ Tham gia server', value: joinedAt, inline: true },
        { name: '🤖 Là bot?', value: isBot, inline: true }
      )
      .setImage(serverAvatar || globalAvatar)
      .setColor(0x8e44ad);

    const bannerBtn = new ButtonBuilder()
      .setCustomId(`getBanner_${userId}`)
      .setLabel('📸 Xem Banner')
      .setStyle(ButtonStyle.Primary);

    const downloadGlobal = new ButtonBuilder()
      .setLabel('⬇️ Tải Avatar Toàn Cục')
      .setStyle(ButtonStyle.Link)
      .setURL(globalAvatar);

    const downloadServer = new ButtonBuilder()
      .setLabel('⬇️ Tải Avatar Server')
      .setStyle(ButtonStyle.Link)
      .setURL(serverAvatar || globalAvatar);

    const row = new ActionRowBuilder().addComponents(bannerBtn, downloadGlobal, downloadServer);
    await message.channel.send({ embeds: [embed], components: [row] });
  } catch (err) {
    console.error(err);
    return message.reply('❌ Không thể tìm thấy người dùng hoặc xảy ra lỗi.');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const userId = interaction.customId.split('_')[1];
  if (!interaction.customId.startsWith('getBanner_')) return;

  try {
    const user = await client.users.fetch(userId);
    await user.fetch();

    if (user.banner) {
      const bannerUrl = user.bannerURL({ size: 4096 });

      const embed = new EmbedBuilder()
        .setTitle(`🎴 Banner của ${user.username}`)
        .setImage(bannerUrl)
        .setColor(0xff4757);

      const disabledBannerBtn = new ButtonBuilder()
        .setCustomId('disabled_banner')
        .setLabel('📸 Đã xem Banner')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

      const updatedRow = new ActionRowBuilder().addComponents(disabledBannerBtn);

      await interaction.update({ components: [updatedRow] });
      await interaction.followUp({ embeds: [embed] });
    } else {
      await interaction.reply({ content: '❌ Người dùng này không có banner.', ephemeral: true });
    }
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '⚠️ Lỗi khi lấy banner.', ephemeral: true });
  }
});

const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Web server is listening on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
