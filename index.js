const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Express is ready.`)
})
//
const { Client, GatewayIntentBits, REST, Routes, ApplicationCommandOptionType, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, AttachmentBuilder, StringSelectMenuBuilder, ActivityType, Partials } = require('discord.js')
const chalk = require('chalk')
const ms = require('ms')
let CronJob = require('cron').CronJob;
//
const { QuickDB, JSONDriver } = require("quick.db");
const jsonDriver = new JSONDriver();
const db = QuickDB.createSingleton({ driver: jsonDriver });

const client = new Client({
  intents: [
    Object.keys(GatewayIntentBits)
  ],
  partials: [
    Object.keys(Partials)
  ]
});

client.on('ready', async () => {
  console.log(chalk.bold.underline.blue(`✅ Logged in as ${client.user.tag}`))
  const rest = new REST({ version: 10 }).setToken(process.env.token);
  const commands = [
    {
      name: `buy_shop`,
      description: `ارسال رسالة شراء المتجر.`,
      dm_permissions: false,
      default_member_permissions: 8,
    },
    {
      name: 'shop',
      description: 'لإنشاء متجر في كاتيجوري محدد.',
      dm_permission: false,
      default_member_permissions: 8,
      options: [
        {
          name: `category`,
          description: `الكاتيقوري الذي سيتم انشاء المتجر به.`,
          required: true,
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildCategory]
        },
        {
          name: `name`,
          description: `اسم المتجر.`,
          type: ApplicationCommandOptionType.String,
          max_length: 24,
          required: true,
        },
        {
          name: `seller`,
          description: `الشخص الذي يمكنه البيع في هذا المتجر.`,
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: `shop_mentions`,
          description: `رتبة منشن المتجر.`,
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: `everyone_mentions`,
          description: `عدد منشنات ايفري ون المسموح بها في هذا المتجر.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: `here_mentions`,
          description: `عدد منشنات هير المسموح بها في هذا المتجر.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: `shop_role_mentions`,
          description: `عدد منشنات رتبة المتجر المسموح بها.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ]
    },
    {
      name: 'give_role',
      description: 'اعطاء رتبة لشخص لمدة محددة',
      dm_permission: false,
      default_member_permissions: 8,
      options: [
        {
          name: `user`,
          description: `العضو الذي تريد تسليمه الرتبة.`,
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: `role`,
          description: `الرتبة التي سيتم تسليمها للعضو.`,
          type: ApplicationCommandOptionType.Role,
          required: true,
        },
        {
          name: `duration`,
          description: `المدة التي سيتم ازالة الرتبة بعد انتهائها.`,
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: `10s`, value: `10s` },
            { name: `1m`, value: `1m` },
            { name: `5m`, value: `5m` },
            { name: `10m`, value: `10m` },
            { name: `30m`, value: `30m` },
            { name: `1h`, value: `1h` },
            { name: `3h`, value: `3h` },
            { name: `6h`, value: `6h` },
            { name: `12h`, value: `12h` },
            { name: `1d`, value: `1d` },
            { name: `3d`, value: `3d` },
            { name: `1w`, value: `1w` },
            { name: `2w`, value: `2w` },
            { name: `4w`, value: `4w` },
          ]
        },
      ]
    },
    {
      name: 'set-mention',
      description: 'تحديد عدد منشنات متجر محدد',
      dm_permission: false,
      default_member_permissions: 8,
      options: [
        {
          name: `shop`,
          description: `حدد المتجر الذي تريد التعديل عليه.`,
          type: ApplicationCommandOptionType.Channel,
          required: true,
          channel_types: [ChannelType.GuildText]
        },
        {
          name: `mention`,
          description: `نوع المنشن.`,
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: `@everyone`, value: `everyone` },
            { name: `@here`, value: `here` },
            { name: `@shop_role`, value: `shop_role` },
          ]
        },
        {
          name: `count`,
          description: `عدد المنشنات الذي سيتم تحديده.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ]
    },
    {
      name: 'mentions',
      description: 'اظهار عدد منشنات المتجر',
      dm_permission: false,
      default_member_permissions: 8,
    },
    {
      name: 'category_mentions',
      description: 'تحديد منشنات كاتيجوري محدد',
      dm_permission: false,
      default_member_permissions: 8,
      options: [
        {
          name: `category`,
          description: `الكاتيجوري الذي تريد تحديد منشناته`,
          type: ApplicationCommandOptionType.Channel,
          channel_types: [ChannelType.GuildCategory],
          required: true
        },
        {
          name: `everyone_mention_count`,
          description: `عدد منشنات ايفري ون المسموح بها.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
        {
          name: `here_mention_count`,
          description: `عدد منشنات هير المسموح بها.`,
          type: ApplicationCommandOptionType.Integer,
          required: true,
        },
      ]
    },
  ];

  (async () => {
    try {
      console.log(`Registring slash commands...`)

      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands }
      )

      console.log(`Slash commands were registered successfully!`)
    } catch (error) {
      console.log(`There was an error : ${error}`)
    }
  })();

  //

  setInterval(async () => {
    const allData = await db.all()
    const data = allData.filter(d => d.id.startsWith(`tempRole_`))
    for (const t of data) {
      const d = t.value;
      if (d.duration < Date.now()) {
        const guild = await client.guilds.fetch(d.guildId).catch(err => { return })
        const user = await guild?.members.fetch(d.userId).catch(err => { return })
        await user.roles.remove(d.roleId)
        console.log(`Role removed from ${user.user.tag}`)
        await db.delete(t.id)
      }
    }
  }, 1000)


var job = new CronJob(
  '00 00 23 * * 4',
  async function() {
    for(const [channelId, channel] of client.guilds.cache.get('938364541413249045').channels.cache){
      if(channel.type === ChannelType.GuildCategory){ 
        const data = await db.get(`categoryMentions_${channel.id}`)
        if(data){
          for (const ch of channel.children.cache) {
            const ob = {
              channelId: ch[0],
              categoryId: channel,
              everyoneMentions: data.everyoneMentions,
              hereMentions: hecount.hereMentions,
            }
            await db.set(`shop_${ch[0]}`, ob)
          }
        }
      }
    }
  },
  null,
  true,
  'Asia/Riyadh'
);
job.start()
})

client.on('interactionCreate', async i => {
  if (i.isChatInputCommand()) {
    switch (i.commandName) {
      case 'shop': {
        const categoryId = i.options.get('category').value;
        const name = i.options.get('name').value;
        const sellerId = i.options.get('seller').value;
        const mentionedRoleId = i.options.get('shop_mentions').value;
        const everyoneMen = i.options.get('everyone_mentions').value;
        const hereMen = i.options.get('here_mentions').value;
        const shopRoleMen = i.options.get('shop_role_mentions').value;

        const channel = await i.guild.channels.create({
          name: `${name}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: i.guild.id,
              deny: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.CreatePublicThreads,
                PermissionFlagsBits.CreatePrivateThreads,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks,
              ],
            },
            {
              id: sellerId,
              allow: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.MentionEveryone,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.UseExternalEmojis,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });
        const ob = {
          channelId: channel.id,
          categoryId: categoryId,
          sellerId: sellerId,
          everyoneMentions: everyoneMen,
          hereMentions: hereMen,
          mentionedRole: mentionedRoleId,
          shopRoleMentions: shopRoleMen,
        }
        await db.set(`shop_${channel.id}`, ob)
        const embed = new EmbedBuilder()
          .setColor('Green')
          .setTitle(`تم انشاء المتجر`)
          .setFields(
            { name: `شات المتجر`, value: `<#${channel?.id}>`, inline: true },
            { name: `رتبة المتجر`, value: `<@${sellerId}>`, inline: true },
            { name: `موعد انشاء المتجر`, value: `<t:${parseInt(Date.now() / 1000)}:R>`, inline: true },
            { name: `عدد منشنات ايفري ون`, value: `${everyoneMen}`, inline: true },
            { name: `عدد منشنات هير`, value: `${hereMen}`, inline: true },
            { name: `عدد منشنات رتبة المتجر`, value: `${shopRoleMen}`, inline: true },
            { name: `رتبة منشن المتجر`, value: `<@&${mentionedRoleId}>`, inline: true },
            { name: `المسؤول`, value: `<@${i.user.id}>`, inline: true },
          )
          .setFooter({ text: `${i.guild.name}`, iconURL: i.guild.iconURL() })
          .setTimestamp()
        await i.reply({ embeds: [embed] })
      } break;
      case 'give_role': {
        const userId = i.options.get('user').value;
        const roleId = i.options.get('role').value;
        const duration = i.options.get('duration').value;

        const msDuration = ms(duration)

        const user = await i.guild.members.fetch(userId).catch(async () => {
          return await i.reply({ content: `❌ **لا يمكنني العثور على هذا العضو.**`, ephemeral: true })
        })
        const role = await i.guild.roles.fetch(roleId).catch(async () => { return })
        await user.roles.add(roleId)
        const ob = {
          guildId: i.guild.id,
          userId: userId,
          roleId: roleId,
          duration: Date.now() + msDuration,
        }
        await db.set(`tempRole_${userId}_${roleId}`, ob)
        await i.reply({ content: `✅ **تم تسليم رتبة \`${role.name}\` الى العضو ${user.user.tag} لمدة \`${duration}\`.**` })
      } break;
      case 'set-mention': {
        const channelId = i.options.get('shop').value;
        const mentionStyle = i.options.get('mention').value;
        const count = i.options.get('count').value;
        const data = await db.get(`shop_${channelId}`)
        if (!data) return await i.reply({ content: `❌ **لا يمكنني العثور على هذا المتجر !**`, ephemeral: true })
        if (mentionStyle === 'everyone') {
          await db.set(`shop_${channelId}.everyoneMentions`, count)
        } else if (mentionStyle === 'here') {
          await db.set(`shop_${channelId}.hereMentions`, count)
        } else if (mentionStyle === 'shop_role') {
          await db.set(`shop_${channelId}.shopRoleMentions`, count)
        }
        await i.reply({ content: `✅ **تم التعديل على عدد منشنات المتجر <#${channelId}> بنجاح.**` })
      } break;
      case 'mentions': {
        const data = await db.get(`shop_${i.channel.id}`)
        if (!data) return await i.reply({ content: `❌ **هذا الشات ليس متجراً !**`, ephemeral: true })
        await i.reply({
          content: `**\`-\`. <:179:1151985210158747708> __Everyone__ : ${data.everyoneMentions}**
**\`-\`. <:179:1151985210158747708> __Here__ : ${data.hereMentions}**
**\`-\`. <:179:1151985210158747708> __Shop mention__ : ${data.shopRoleMentions}**`
        })
      } break;
      case 'category_mentions': {
        const categoryId = i.options.get('category').value;
        const evcount = i.options.get('everyone_mention_count').value;
        const hecount = i.options.get('here_mention_count').value;

        const category = await i.guild.channels.fetch(categoryId).catch(async () => {
          return i.reply({ content: `❌ **لا يمكنني الوصول على هذا الكاتيجوري !**`, ephemeral: true })
        })
        for (const channel of category.children.cache) {
          const ob = {
            channelId: channel[0],
            categoryId: categoryId,
            everyoneMentions: evcount,
            hereMentions: hecount,
          }
          await db.set(`shop_${channel[0]}`, ob)
        }
          const ob = {
            categoryId: categoryId,
            everyoneMentions: evcount,
            hereMentions: hecount,
          }
        await db.set(`categoryMentions_${categoryId}`, ob)
        await i.reply({ content: `✅ **تم تحديد المنشنات في الكاتيجوري \`${category.name}\`**` })
      } break;
      case 'buy_shop': {
        const row = new ActionRowBuilder()
          .addComponents(new ButtonBuilder()
            .setCustomId('buy_shop_ticket')
            .setLabel('تـكت مـتـجر')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('<a:3FA2:1155528950173405204>')
          )
        await client.channels.cache.get(i.channel.id).send({ content: `\`-\` <a:3FA2:1155528950173405204> **__لشراء المتجر يرجى الضغط على اسفل الكلام__**`, components: [row] })
        await i.reply({ content: '✅', ephemeral: true })
      }
    }
  } else if (i.isButton()) {
    switch (i.customId) {
      case 'buy_shop_ticket': {
        const data = await db.get(`buy_shop_ticket_${i.member.id}`)
        if (data) return await i.reply({ content: `❌ **رجاء قم بمراجعة تذكرتك قبل فتح تذكرة جديدة - <#${data.channelId}>**`, ephemeral: true })
        await i.deferReply({ ephemeral: true }).catch({})
        const channel = await i.guild.channels.create({
          name: `buy shop ${i.user.tag}`,
          type: ChannelType.GuildText,
          parent: '1128221629583986709',
          permissionOverwrites: [
            {
              id: i.user.id,
              allow: [
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel,
              ]
            },
            {
              id: i.guild.id,
              deny: [
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ViewChannel
              ]
            },
          ]
        });
        await db.set(`buy_shop_ticket_${i.member.id}`, { userId: i.member.id, channelId: channel.id })
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('king-shop')
              .setLabel('King')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('nightmare-shop')
              .setLabel('NightMare')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('emerald-shop')
              .setLabel('Emerald')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('diamond-shop')
              .setLabel('Diamond')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
          .addComponents(
            new ButtonBuilder()
              .setCustomId('platinum-shop')
              .setLabel('Platinum')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
        const row2 = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('gold-shop')
              .setLabel('Gold')
              .setStyle(ButtonStyle.Primary)
              .setEmoji('<a:3FA2:1155528950173405204>')
          )
        await channel.send({ content: `||<@${i.member.id}>|| \`-\` **__ <a:3FA2:1155528950173405204> يرجى الضغط على المتجر المراد للشراء__**`, components: [row, row2] })
        await i.editReply({ content: `✅** تم انشاء تذكرتك - <#${channel.id}>**`, ephemeral: true })
      } break;
      case 'king-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })

        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 473685` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$450000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
              const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1137147484255301763`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              
              const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
        
      } break;
      case 'nightmare-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })
        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 315790` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$300000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
             const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1118309553281454121`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              i.channel.send({ content : `<#${channel.id}>`})
              const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
      } break;
      case 'emerald-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })
        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 210527` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$200000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
             const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1118948736136126514`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              
                const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
      } break;
      case 'diamond-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })
        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 105264` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$100000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
             const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1117845540617605160`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              
              const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
      } break;
      case 'platinum-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })
        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 52632` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$50000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
             const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1115745646146748528`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              
              const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
      } break;
      case 'gold-shop': {
        const data = await db.get(`shop_credit_${i.member.id}`)
        if (data) return await i.reply({ content: `**لا يمكنك شراء متجرين في نفس الوقت.**`, ephemeral: true })
        await i.deferUpdate();
        await client.channels.cache.get(i.channel.id)?.send({
          content: `- <@${i.member.id}>
**#- <a:3FA2:1155528950173405204> لشراء المتجر يرجى تحويل المبلغ الاتي :
#- <a:3FA2:1155528950173405204> __لديك 60 ثانيه للتحويل__**
#credit 790998786842558464 26316` })
        await db.set(`shop_credit_${i.member.id}`, i.member.id)

        const collectorFilter = m => m.author.bot === true;
          
        const collector = i.channel.createMessageCollector({ filter: collectorFilter, time: 60000 });
        collector.on('collect', async c => {
          if(c.content == `**:moneybag: | ${i.user.username}, has transferred \`$25000\` to <@!790998786842558464> **`){
            collector.stop('DONE')
          }
        })

        collector.on('end', async (collected, reason) => {
          console.log(reason)
          if(reason === 'DONE'){
            const msg = await i.channel.send({ content : `\`-\` **<@${i.member.id}>رجاء قم بكتابة اسم المتجر.**
\`-\` **__لا يمكنك تغيير الاسم بعد كتابته.__**` })
            
            const collectorFilter = m => m.author.id === i.user.id;
            
            await i.channel.awaitMessages({ filter : collectorFilter, max : 1, time : 300000, errors : ['time'] })
            .then(async (m) => {
              await m.first().channel.send({ content : `\`-\` **<@${m.first().author.id}> تم انشاء متجرك.**
\`-\` **اسم المتجر : 「🛒」丨متجر・${m.first().content}**` })
              await db.delete(`shop_credit_${i.member.id}`)
             const channel = await m.first().guild.channels.create({
                name : `「🛒」丨متجر・${m.first().content}`,
                type : ChannelType.GuildText,
                parent : `1116764250162090045`,
                permissionOverwrites: [
                  {
                    id: i.guild.id,
                    deny: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.CreatePublicThreads,
                      PermissionFlagsBits.CreatePrivateThreads,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.EmbedLinks,
                    ],
                  },
                  {
                    id: i.user.id,
                    allow: [
                      PermissionFlagsBits.SendMessages,
                      PermissionFlagsBits.AddReactions,
                      PermissionFlagsBits.AttachFiles,
                      PermissionFlagsBits.MentionEveryone,
                      PermissionFlagsBits.EmbedLinks,
                      PermissionFlagsBits.UseExternalEmojis,
                      PermissionFlagsBits.ReadMessageHistory,
                    ],
                  },
                ],
              })
              const data = await db.get(`categoryMentions_${channel.parentId}`)
              if(data){
                const ob = {
                channelId: channel.id,
                categoryId: data.categoryId,
                everyoneMentions: data.everyoneMentions,
                hereMentions: data.hereMentions,
                }
                await db.set(`shop_${channel.id}`, ob)
              }
              
              const embed = new EmbedBuilder()
              .setColor('Red')
              .setTitle('تم انشاء المتجر')
              .setFields(
                { name : `تم انشاء متجر :`, value : `${channel.name}`, inline : true },
                { name : `نوعه :`, value : `${channel.parent.name}`, inline : true },
                { name : `بواسطة :`, value : `${i.user.username}`, inline : true },
                { name : `صاحب المتجر :`, value : `<@${i.user.id}>`, inline : true },
              )
              .setImage('attachment://Untitled23.png')
              .setFooter({ text : 'Dev by : BLC' })
  await channel.send({ embeds : [embed], files : ['./Untitled23.png'] })
            }).catch(async (err) => {
              console.log(err)
              msg.edit({ content : `**لم يتم كتابة اسم في الوقت المحدد.**` })
              await db.delete(`shop_credit_${i.member.id}`)
            })
          }
        })
      } break;
    }
  }
})

client.on('messageCreate', async message => {
  if (!message.guild) return;
  const data = await db.get(`shop_${message.channel.id}`)
  if (data) {
    if (data.everyoneMentions < 1 || data.hereMentions < 1 || data.shopRoleMentions < 1) {
      await message.channel.permissionOverwrites.create(message.guild.id, { ViewChannel: false })
      await message.channel.permissionOverwrites.create(data.sellerId, { ViewChannel: false })
    } else {
      if (message.content.includes('@everyone')) {
        await db.sub(`shop_${message.channel.id}.everyoneMentions`, 1)
      }
      if (message.content.includes('@here')) {
        await db.sub(`shop_${message.channel.id}.hereMentions`, 1)
      }
      if (message.content.includes(`<@&${data.mentionedRole}>`)) {
        await db.sub(`shop_${message.channel.id}.shopRoleMentions`, 1)
      }
    }
  }
  if (message.channel.name.startsWith('buy-shop-')) {
    if (message.content === '!close') {
      message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('```جاري اغلاق التذكرة...```')] })
      await db.delete(`shop_credit_${message.author.id}`)
      await db.delete(`buy_shop_ticket_${message.author.id}`)
      setTimeout(() => {
        message.channel.delete()
      }, 3000)
    }
  }
})

client.login(process.env.token).catch(() => {
  console.log(chalk.red('The Token is not valid'))
})

process.on("error", async (err) => { console.log(err) });
process.on("unhandledRejection", async (reason, promise) => { console.log(reason) });
process.on("uncaughtException", async (err, origin) => { console.log(err) });
process.on("uncaughtExceptionMonitor", async (err, origin) => { console.log(err) });
process.on("warning", async (warn) => { console.log(warn) });