require('dotenv').config();
const fs = require('fs');
const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
  ChannelType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const COLORS = {
  main: 0x2b2d31,
  success: 0x57F287,
  error: 0xED4245,
  info: 0x5865F2
};

/* VOICE SYSTEM */
const voiceFile = "./voiceTimes.json";
let voiceTimes = {};
let joinTimes = {};

if (fs.existsSync(voiceFile)) {
  voiceTimes = JSON.parse(fs.readFileSync(voiceFile));
}

const saveVoice = () =>
  fs.writeFileSync(voiceFile, JSON.stringify(voiceTimes, null, 2));

/* ================= COMMANDES ================= */

const commands = [
  { name: "ping", description: "Répond Pong" },
  { name: "hello", description: "Dire bonjour" },
  { name: "lol", description: "Ping everyone LoL" },

  {
    name: "pp",
    description: "Afficher avatar",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur cible",
        required: false
      }
    ]
  },

  {
    name: "temps-voc",
    description: "Temps vocal utilisateur",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur cible",
        required: false
      }
    ]
  },

  { name: "vocstatus", description: "Liste des personnes en vocal" },
  { name: "serverinfo", description: "Infos serveur" },
  { name: "help", description: "Liste des commandes" },
  { name: "ram", description: "Utilisation RAM du bot" },
  { name: "reload", description: "Met à jour les commandes" },
  { name: "shutdown", description: "Éteindre le bot (code secret)" },

  {
    name: "ban",
    description: "Bannir un utilisateur",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur à bannir",
        required: true
      }
    ]
  },

  {
    name: "kick",
    description: "Kick un utilisateur",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur à kick",
        required: true
      }
    ]
  },

  {
    name: "unban",
    description: "Unban un utilisateur",
    options: [
      {
        name: "id",
        type: 3,
        description: "ID utilisateur",
        required: true
      }
    ]
  },

  {
    name: "mute",
    description: "Mute utilisateur",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur",
        required: true
      },
      {
        name: "temps",
        type: 3,
        description: "ex: 10m / 1h / 1d",
        required: true
      }
    ]
  },

  {
    name: "warn",
    description: "Warn utilisateur",
    options: [
      {
        name: "utilisateur",
        type: 6,
        description: "Utilisateur",
        required: true
      },
      {
        name: "raison",
        type: 3,
        description: "Raison",
        required: true
      }
    ]
  },

  {
    name: "clear",
    description: "Supprimer messages",
    options: [
      {
        name: "nombre",
        type: 4,
        description: "Nombre de messages",
        required: true
      },
      {
        name: "channel",
        type: 7,
        description: "Salon cible",
        required: true
      }
    ]
  },

  {
    name: "lock",
    description: "Lock un salon",
    options: [
      {
        name: "channel",
        type: 7,
        description: "Salon cible",
        required: true
      }
    ]
  },

  {
    name: "unlock",
    description: "Unlock un salon",
    options: [
      {
        name: "channel",
        type: 7,
        description: "Salon cible",
        required: true
      }
    ]
  },

  {
    name: "createchannel",
    description: "Créer un salon",
    options: [
      {
        name: "nom",
        type: 3,
        description: "Nom du salon",
        required: true
      }
    ]
  },

  {
    name: "deletechannel",
    description: "Supprimer un salon",
    options: [
      {
        name: "channel",
        type: 7,
        description: "Salon cible",
        required: true
      }
    ]
  }
];

/* REGISTER */
client.once("clientReady", async () => {
  console.log("Bot connecté");

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands }
  );

  console.log("Commandes OK");
});

/* VOICE */
client.on("voiceStateUpdate", (oldState, newState) => {
  const id = newState.id;

  if (!oldState.channelId && newState.channelId)
    joinTimes[id] = Date.now();

  if (oldState.channelId && !newState.channelId) {
    const start = joinTimes[id];
    if (!start) return;

    voiceTimes[id] = (voiceTimes[id] || 0) + (Date.now() - start);
    delete joinTimes[id];
    saveVoice();
  }
});

/* INTERACTIONS */
client.on("interactionCreate", async (interaction) => {

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "shutdown_modal") {
      const code = interaction.fields.getTextInputValue("code");

      if (code !== "ilies212") {
        return interaction.reply({ content: "❌ Mauvais code", ephemeral: true });
      }

      await interaction.reply("🔴 Bot éteint...");
      process.exit(0);
    }
  }

  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  if (cmd === "ping") return interaction.reply("Pong 🏓");
  if (cmd === "hello") return interaction.reply("Salut 👋");
  if (cmd === "lol")
    return interaction.reply({
      content: "@everyone LoL",
      allowedMentions: { parse: ["everyone"] }
    });

  if (cmd === "ram") {
    const usage = process.memoryUsage();
    
    // Convertir en MB
    const heapUsed = (usage.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotal = (usage.heapTotal / 1024 / 1024).toFixed(2);
    const rss = (usage.rss / 1024 / 1024).toFixed(2);
    const external = (usage.external / 1024 / 1024).toFixed(2);
    
    // Créer l'embed
    const ramEmbed = new EmbedBuilder()
      .setTitle("📊 Utilisation RAM du Bot")
      .setColor(COLORS.info)
      .addFields(
        { name: "💾 Heap Utilisée", value: `${heapUsed} MB`, inline: true },
        { name: "💾 Heap Totale", value: `${heapTotal} MB`, inline: true },
        { name: "🔴 RSS (Mémoire Réelle)", value: `${rss} MB`, inline: true },
        { name: "⚙️ Externe", value: `${external} MB`, inline: true },
        { name: "🖥️ Pourcentage", value: `${((usage.heapUsed / usage.heapTotal) * 100).toFixed(2)}%`, inline: true },
        { name: "⏱️ Uptime", value: `${Math.floor(process.uptime() / 60)} minutes`, inline: true }
      )
      .setFooter({ text: "Render.com" })
      .setTimestamp();

    return interaction.reply({ embeds: [ramEmbed] });
  }

  if (cmd === "shutdown") {
    const modal = new ModalBuilder()
      .setCustomId("shutdown_modal")
      .setTitle("Shutdown bot");

    const input = new TextInputBuilder()
      .setCustomId("code")
      .setLabel("Code secret")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    return interaction.showModal(modal);
  }
});

client.login(process.env.TOKEN);
