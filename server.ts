import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY is not configured or uses default template value. Server will run with fallback rules.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client:", error);
}

// Initial Seeding Database Data
const initialClasses = [
  { id: "VII_A", name: "VII A", waliKelasName: "Bu Rina", pointKebersihan: 945, pointPerilaku: 1250 },
  { id: "VIII_A", name: "VIII A", waliKelasName: "Pak Andi", pointKebersihan: 910, pointPerilaku: 1180 },
  { id: "VIII_B", name: "VIII B", waliKelasName: "Pak Bambang", pointKebersihan: 875, pointPerilaku: 1110 },
  { id: "VIII_C", name: "VIII C", waliKelasName: "Bu Sinta", pointKebersihan: 820, pointPerilaku: 920 },
  { id: "IX_B", name: "IX B", waliKelasName: "Bu Retno", pointKebersihan: 790, pointPerilaku: 1020 }
];

const initialUsers = [
  {
    id: "siswa_1",
    username: "aurelia",
    password: "123",
    name: "Aurelia Putri",
    role: "siswa" as const,
    kelasId: "VII_A",
    pointSopan: 320,
    pointBersih: 150,
    badges: ["Sopan Santun", "Kelas Bersih", "Peduli Teman", "Disiplin"],
    bio: "Berusaha menjadi pribadi yang lebih baik setiap hari.",
    apresiasiDiterima: 12
  },
  {
    id: "siswa_2",
    username: "fauzi",
    password: "123",
    name: "Ahmad Fauzi",
    role: "siswa" as const,
    kelasId: "VIII_B",
    pointSopan: 280,
    pointBersih: 120,
    badges: ["Sopan Santun", "Peduli Teman"],
    bio: "Selalu bersemangat belajar dan senang menolong sesama teman.",
    apresiasiDiterima: 8
  },
  {
    id: "siswa_3",
    username: "clara",
    password: "123",
    name: "Clara Anastasia",
    role: "siswa" as const,
    kelasId: "VIII_A",
    pointSopan: 340,
    pointBersih: 140,
    badges: ["Disiplin", "Sopan Santun"],
    bio: "Disiplin memulai segalanya menjadi lebih percaya diri.",
    apresiasiDiterima: 15
  },
  {
    id: "guru_1",
    username: "bk",
    password: "123",
    name: "Ibu Hermin, S.Pd.",
    role: "guru_bk" as const,
    kelasId: "GURU_BK",
    pointSopan: 0,
    pointBersih: 0,
    badges: [],
    bio: "Konselor BK Utama Respect Meter Sekolah.",
    apresiasiDiterima: 0
  },
  {
    id: "wali_1",
    username: "rina",
    password: "123",
    name: "Bu Rina",
    role: "wali_kelas" as const,
    kelasId: "VII_A",
    pointSopan: 0,
    pointBersih: 0,
    badges: [],
    bio: "Wali kelas VII A yang ramah dan disiplin.",
    apresiasiDiterima: 0
  },
  {
    id: "admin_1",
    username: "admin",
    password: "admin",
    name: "Admin Sekolah",
    role: "admin" as const,
    kelasId: "ADMIN",
    pointSopan: 0,
    pointBersih: 0,
    badges: [],
    bio: "System Administrator Sekolah.",
    apresiasiDiterima: 0
  }
];

const initialLogs = [
  {
    id: "log_1",
    studentId: "siswa_1",
    studentName: "Aurelia Putri",
    kelasId: "VII_A",
    type: "apresiasi" as const,
    points: 20,
    description: "Mendapat apresiasi dari teman: Membantu guru piket menyapu lobi",
    date: "12 Mei 2026",
    giverName: "Ahmad Fauzi",
    isVerified: true
  },
  {
    id: "log_2",
    studentId: "siswa_1",
    studentName: "Aurelia Putri",
    kelasId: "VII_A",
    type: "sopan" as const,
    points: 15,
    description: "Berbicara sangat sopan dan mengucapkan permisi saat masuk ruang guru",
    date: "10 Mei 2026",
    giverName: "Ibu Hermin, S.Pd.",
    isVerified: true
  },
  {
    id: "log_3",
    studentId: "siswa_1",
    studentName: "Aurelia Putri",
    kelasId: "VII_A",
    type: "bersih" as const,
    points: 25,
    description: "Mengkoordinir pembersihan rutin hingga kelas VII A memenangkan Kelas Terbersih",
    date: "7 Mei 2026",
    giverName: "Ibu Hermin, S.Pd.",
    isVerified: true
  },
  {
    id: "log_4",
    studentId: "siswa_2",
    studentName: "Ahmad Fauzi",
    kelasId: "VIII_B",
    type: "apresiasi" as const,
    points: 15,
    description: "Membantu menyeberangkan siswa berkebutuhan khusus saat pulang sekolah",
    date: "11 Mei 2026",
    giverName: "Clara Anastasia",
    isVerified: false
  }
];

const initialEthicGuides = [
  {
    id: "ethic_1",
    title: "Cara Berbicara Sopan Dengan Guru",
    category: "Sopan" as const,
    description: "Kesantunan dalam ucapan adalah cerminan kemurnian budi pekerti kita kepada guru sebagai orang tua kedua.",
    tips: [
      "Tatap wajah guru dengan pandangan lembut dan tidak menantang.",
      "Gunakan nada bicara rendah-menengah, serta tidak berbisik atau berteriak.",
      "Membiasakan 3 Kata Ajaib: Tolong, Permisi, dan Terima Kasih."
    ]
  },
  {
    id: "ethic_2",
    title: "Cara Meminta Izin di Kelas",
    category: "Disiplin" as const,
    description: "Menghormati kelas yang berjalan menciptakan harmoni belajar yang kondusif bagi semua.",
    tips: [
      "Angkat tangan kanan terlebih dahulu sebelum menyampaikan permohonan.",
      "Tunggu sampai guru melihat atau mengizinkan Anda berbicara.",
      "Sampaikan izin dengan singkat, padat, dan kepala menunduk tipis."
    ]
  },
  {
    id: "ethic_3",
    title: "Sikap Saat Ditegur Guru",
    category: "Etika" as const,
    description: "Teguran guru adalah wujud cinta kasih agar kita terhindar dari ketimpangan karakter di masa depan.",
    tips: [
      "Dengarkan nasehat tanpa memotong kalimat penjelasan guru.",
      "Akui kesalahan ksatria jika Anda keliru dan berjanji memperbaiki diri.",
      "Jaga bahasa tubuh tetap tunduk, tenang, dan tangan tertaut di depan."
    ]
  },
  {
    id: "ethic_4",
    title: "Stop Perundungan (Anti-Bullying)",
    category: "Anti-Bullying" as const,
    description: "Setiap perkataan atau candaan yang menyakiti fisik, hati, atau mental teman merupakan kegagalan karakter.",
    tips: [
      "Pikirkan perasaan teman sebelum mengucapkan candaan berlebih.",
      "Saling merangkul perbedaan fisik, suku, ras, agama, maupun akademik.",
      "Berani melaporkan secara rahasia ke ruang BK jika melihat teman dirundung."
    ]
  }
];

const initialRewards = [
  {
    id: "rew_1",
    title: "Voucher Kantin Sehat IDR 20k",
    pointsCost: 100,
    description: "Gunakan voucher untuk membeli makanan berat atau minuman bergizi di kantin sekolah.",
    type: "siswa" as const,
    stock: 15
  },
  {
    id: "rew_2",
    title: "Buku Catatan Eksklusif Karakter",
    pointsCost: 150,
    description: "Notebook bergaris tebal dengan sampul kulit sintetis bergambar maskot Respect Meter.",
    type: "siswa" as const,
    stock: 8
  },
  {
    id: "rew_3",
    title: "Sertifikat Utama Siswa Karakter BK",
    pointsCost: 200,
    description: "Sertifikat resmi bertandatangan Kepala Sekolah dan Guru BK untuk rekam jejak SNMPTN.",
    type: "siswa" as const,
    stock: 50
  },
  {
    id: "rew_4",
    title: "Hak Jam Istirahat Tambahan Kelas (+15 Mins)",
    pointsCost: 600,
    description: "Khusus untuk ditukar bersama seluruh siswa sekelas. Memperpanjang waktu bersantai di lobi.",
    type: "kelas" as const,
    stock: 5
  }
];

const initialReminders = [
  {
    id: "rem_1",
    title: "Hormati Guru, Muliakan Ilmu",
    text: "Sopan dalam berbicara berarti kita menghargai ilmu yang disampaikan oleh Bapak/Ibu guru.",
    author: "Ibu Hermin, S.Pd.",
    date: "Hari Ini"
  },
  {
    id: "rem_2",
    title: "Kebersihan adalah Iman",
    text: "Piket kelas bukan beban individu, tapi kepedulian kelompok untuk lingkungan belajar yang bersih.",
    author: "Sistem Respect",
    date: "Kemarin"
  }
];

const initialQuizzes = [
  {
    id: "q_1",
    question: "Apa tindakan terbaik jika Anda tidak sengaja menyenggol tumpukan buku milik guru di koridor hingga jatuh?",
    options: [
      "Pura-pura tidak tahu dan langsung berjalan cepat menghindari keramaian.",
      "Segera jongkok, meminta maaf dengan tulus, lalu membantu merapikan tumpukannya.",
      "Menyalahkan murid lain yang berjalan di sebelah Anda sehingga tidak sengaja menolak.",
      "Menaruh buku kembali tanpa meminta maaf karena guru tersebut bersikap santai."
    ],
    correctAnswerIndex: 1,
    explanation: "Meminta maaf secara tulus dan langsung membereskan tumpukan buku menunjukkan kepedulian, integritas, dan sopan santun utama murid berkarakter luhur.",
    pointsReward: 15
  },
  {
    id: "q_2",
    question: "Saat teman sebangku Anda sedang merundung siswa baru karena bentuk giginya yang kurang rapi, apa yang harus Anda lakukan?",
    options: [
      "Ikut tertawa keras agar dianggap lucu oleh circle pertemanan lainnya.",
      "Mendiamkannya saja karena itu bukan urusan pribadi saya.",
      "Secara tegas memintanya berhenti, lalu mengajak murid baru tersebut mengobrol akrab, dan melapor ke BK.",
      "Merekam pembicaran tersebut lalu menyebarkannya kembali ke TikTok sebagai konten seru."
    ],
    correctAnswerIndex: 2,
    explanation: "Mencegah perundungan dengan mengajak korban berteman baik dan mengadu ke pihak sekolah (Guru BK) mencerminkan kepahlawanan moral dan kesetiakawanan sosial.",
    pointsReward: 15
  }
];

interface DBLog {
  id: string;
  studentId: string;
  studentName: string;
  kelasId: string;
  type: "sopan" | "bersih" | "apresiasi" | "etika";
  points: number;
  description: string;
  date: string;
  giverName: string;
  isVerified: boolean;
}

interface DBUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: "siswa" | "guru_bk" | "wali_kelas" | "admin";
  kelasId: string;
  pointSopan: number;
  pointBersih: number;
  badges: string[];
  bio: string;
  apresiasiDiterima: number;
  avatarEmoji?: string;
  avatarColor?: string;
  avatarImage?: string;
}

// Database Helper
interface DatabaseType {
  classes: typeof initialClasses;
  users: DBUser[];
  logs: DBLog[];
  ethicGuides: typeof initialEthicGuides;
  rewards: typeof initialRewards;
  reminders: typeof initialReminders;
  quizzes: typeof initialQuizzes;
}

const loadDB = (): DatabaseType => {
  if (!fs.existsSync(DB_FILE)) {
    const data: DatabaseType = {
      classes: initialClasses,
      users: initialUsers,
      logs: initialLogs,
      ethicGuides: initialEthicGuides,
      rewards: initialRewards,
      reminders: initialReminders,
      quizzes: initialQuizzes
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }
  try {
    const fileContent = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(fileContent) as DatabaseType;
  } catch (err) {
    console.error("Error reading database, resetting to initial value:", err);
    const data: DatabaseType = {
      classes: initialClasses,
      users: initialUsers,
      logs: initialLogs,
      ethicGuides: initialEthicGuides,
      rewards: initialRewards,
      reminders: initialReminders,
      quizzes: initialQuizzes
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    return data;
  }
};

const saveDB = (data: DatabaseType) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
};

async function startServer() {
  const app = express();
  app.use(express.json());

  // Seeding log
  loadDB();

  // API Routes
  app.get("/api/data", (req, res) => {
    const db = loadDB();
    res.json(db);
  });

  // Login handler
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const db = loadDB();
    
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      // Find associated class
      const userClass = db.classes.find((c) => c.id === user.kelasId);
      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          kelasId: user.kelasId,
          pointSopan: user.pointSopan,
          pointBersih: user.pointBersih,
          badges: user.badges,
          bio: user.bio,
          apresiasiDiterima: user.apresiasiDiterima,
          avatarEmoji: user.avatarEmoji || (user.role === "siswa" ? "✨" : "🎓"),
          avatarColor: user.avatarColor || "indigo",
          avatarImage: user.avatarImage || "",
          className: userClass ? userClass.name : ""
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Kombinasi Username & Kata Sandi salah." });
    }
  });

  // Admin: Add Class
  app.post("/api/classes/add", (req, res) => {
    const { name, waliKelasName } = req.body;
    if (!name || !waliKelasName) {
      return res.status(400).json({ error: "Nama kelas dan nama wali kelas wajib diisi." });
    }

    const db = loadDB();
    const id = name.trim().toUpperCase().replace(/\s+/g, "_");

    if (db.classes.find(c => c.id === id)) {
      return res.status(400).json({ error: `Kelas dengan kode/nama ${name} sudah terdaftar.` });
    }

    const newClass = {
      id,
      name,
      waliKelasName,
      pointKebersihan: 0,
      pointPerilaku: 0
    };

    db.classes.push(newClass);
    saveDB(db);
    res.json({ success: true, class: newClass });
  });

  // Admin: Add Student / User
  app.post("/api/students/add", (req, res) => {
    const { username, name, role, kelasId, password, bio } = req.body;
    if (!username || !name || !role || !password) {
      return res.status(400).json({ error: "Username, nama lengkap, role, dan password wajib diisi." });
    }

    const db = loadDB();
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(400).json({ error: "Username sudah terdaftar di sistem." });
    }

    const userCount = db.users.length;
    const newId = `user_${Date.now()}_${userCount + 1}`;

    const newUser = {
      id: newId,
      username: username.toLowerCase().trim(),
      password: password,
      name: name,
      role: role,
      kelasId: kelasId || "SEKOLAH",
      pointSopan: role === "siswa" ? 100 : 0, // Start with default 100 points
      pointBersih: role === "siswa" ? 50 : 0, // Start with default 50 points
      badges: role === "siswa" ? ["Disiplin"] : [],
      bio: bio || (role === "siswa" ? "Berusaha berkarakter terpuji." : "Pendidik sekolah."),
      apresiasiDiterima: 0
    };

    db.users.push(newUser);
    saveDB(db);
    res.json({ success: true, user: newUser });
  });

  // Delete student/user API for better control
  app.post("/api/students/delete", (req, res) => {
    const { id } = req.body;
    const db = loadDB();
    const index = db.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      db.users.splice(index, 1);
      saveDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Siswa tidak ditemukan." });
    }
  });

  // Update profile: name, bio, password, avatarEmoji, avatarColor, avatarImage
  app.post("/api/profile/update", (req, res) => {
    const { userId, name, bio, password, avatarEmoji, avatarColor, avatarImage } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID wajib dilalui." });
    }

    const db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (bio !== undefined) {
      user.bio = bio.trim();
    }
    if (password && password.trim()) {
      user.password = password;
    }
    if (avatarEmoji !== undefined) {
      user.avatarEmoji = avatarEmoji;
    }
    if (avatarColor !== undefined) {
      user.avatarColor = avatarColor;
    }
    if (avatarImage !== undefined) {
      user.avatarImage = avatarImage;
    }

    saveDB(db);
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        kelasId: user.kelasId,
        pointSopan: user.pointSopan,
        pointBersih: user.pointBersih,
        badges: user.badges,
        bio: user.bio,
        apresiasiDiterima: user.apresiasiDiterima,
        avatarEmoji: user.avatarEmoji || (user.role === "siswa" ? "✨" : "🎓"),
        avatarColor: user.avatarColor || "indigo",
        avatarImage: user.avatarImage || ""
      }
    });
  });

  // BK/Wali Kelas: Add/Deduct Points to active student
  app.post("/api/points/add", (req, res) => {
    const { studentId, type, points, description, giverName } = req.body;
    if (!studentId || !type || !points || !description) {
      return res.status(400).json({ error: "Parameter poin kurang lengkap." });
    }

    const db = loadDB();
    const student = db.users.find(u => u.id === studentId);
    if (!student) {
      return res.status(404).json({ error: "Murid tidak ditemukan." });
    }

    // Add points to individual
    const pointValue = Number(points);
    if (type === "sopan") {
      student.pointSopan = Math.max(0, student.pointSopan + pointValue);
    } else if (type === "bersih") {
      student.pointBersih = Math.max(0, student.pointBersih + pointValue);
    }

    // Update aggregate class values
    const studentClass = db.classes.find(c => c.id === student.kelasId);
    if (studentClass) {
      if (type === "sopan") {
        studentClass.pointPerilaku = Math.max(0, studentClass.pointPerilaku + pointValue);
      } else if (type === "bersih") {
        studentClass.pointKebersihan = Math.max(0, studentClass.pointKebersihan + pointValue);
      }
    }

    // Auto reward new badges based on point thresholds
    if (type === "sopan" && student.pointSopan >= 400 && !student.badges.includes("Bintang Santun")) {
      student.badges.push("Bintang Santun");
    }
    if (type === "bersih" && student.pointBersih >= 200 && !student.badges.includes("Pahlawan Kebersihan")) {
      student.badges.push("Pahlawan Kebersihan");
    }

    // Add activity log
    const logId = `log_${Date.now()}`;
    const newLog = {
      id: logId,
      studentId: student.id,
      studentName: student.name,
      kelasId: student.kelasId,
      type: type as "sopan" | "bersih",
      points: pointValue,
      description: description,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      giverName: giverName || "Guru BK",
      isVerified: true
    };

    db.logs.unshift(newLog);
    saveDB(db);

    res.json({ success: true, user: student, log: newLog, class: studentClass });
  });

  // Student: Add Peer Appreciation Log (needs BK Verification)
  app.post("/api/logs/apresiasi", (req, res) => {
    const { studentId, targetStudentId, description, giverName } = req.body;
    if (!targetStudentId || !description || !studentId) {
      return res.status(400).json({ error: "Penerima apresiasi dan penjelasan tindakan wajib diisi." });
    }

    const db = loadDB();
    const sourceStudent = db.users.find(u => u.id === studentId);
    const targetStudent = db.users.find(u => u.id === targetStudentId);

    if (!targetStudent) {
      return res.status(404).json({ error: "Siswa penerima tidak ditemukan." });
    }

    const logId = `log_${Date.now()}`;
    const newLog = {
      id: logId,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      kelasId: targetStudent.kelasId,
      type: "apresiasi" as const,
      points: 10, // Default peer appreciation is 10 points once verified
      description: `Apresiasi teman: ${description}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      giverName: giverName || sourceStudent?.name || "Teman Kelas",
      isVerified: false // Needs BK review to reward the actual points
    };

    db.logs.unshift(newLog);
    saveDB(db);

    res.json({ success: true, log: newLog });
  });

  // Guru BK: Verify Peer Appreciation Log (gives point and flags true)
  app.post("/api/logs/verify", (req, res) => {
    const { logId, isApproved } = req.body;
    if (!logId) {
      return res.status(400).json({ error: "ID Log wajib dilalui." });
    }

    const db = loadDB();
    const logIndex = db.logs.findIndex(l => l.id === logId);
    if (logIndex === -1) {
      return res.status(404).json({ error: "Log tidak ditemukan." });
    }

    const targetLog = db.logs[logIndex];

    if (isApproved) {
      targetLog.isVerified = true;
      
      // Award the points to the recipient
      const student = db.users.find(u => u.id === targetLog.studentId);
      if (student) {
        student.pointSopan += targetLog.points;
        student.apresiasiDiterima += 1;

        // update class aggregate too
        const studentClass = db.classes.find(c => c.id === student.kelasId);
        if (studentClass) {
          studentClass.pointPerilaku += targetLog.points;
        }

        // Auto reward peer-support badge if they accumulate 5+ verified reviews
        if (student.apresiasiDiterima >= 5 && !student.badges.includes("Sahabat Peduli")) {
          student.badges.push("Sahabat Peduli");
        }
      }
    } else {
      // Remove disapproved log
      db.logs.splice(logIndex, 1);
    }

    saveDB(db);
    res.json({ success: true });
  });

  // Student: Redeem Karakter Rewards
  app.post("/api/rewards/redeem", (req, res) => {
    const { userId, rewardId } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.id === userId);
    const reward = db.rewards.find(r => r.id === rewardId);

    if (!user || !reward) {
      return res.status(404).json({ error: "User atau Item Reward tidak ditemukan." });
    }

    if (reward.stock <= 0) {
      return res.status(400).json({ error: "Yikes! Stok Item Reward ini sudah habis." });
    }

    const cost = reward.pointsCost;
    if (reward.type === "siswa") {
      const totalPoints = user.pointSopan + user.pointBersih;
      if (totalPoints < cost) {
        return res.status(400).json({ error: `Poin tidak mencukupi. Anda butuh ${cost} poin (Poin saat ini: S:${user.pointSopan} B:${user.pointBersih}).` });
      }

      // Deduct proportionally from Sopan first, then Bersih
      if (user.pointSopan >= cost) {
        user.pointSopan -= cost;
      } else {
        const structuralDebt = cost - user.pointSopan;
        user.pointSopan = 0;
        user.pointBersih = Math.max(0, user.pointBersih - structuralDebt);
      }
    } else {
      // Class Level Reward Redemptions
      const studentClass = db.classes.find(c => c.id === user.kelasId);
      if (!studentClass) {
        return res.status(400).json({ error: "Siswa tidak tergabung dalam kelas manapun." });
      }

      const totalClassPoints = studentClass.pointPerilaku + studentClass.pointKebersihan;
      if (totalClassPoints < cost) {
        return res.status(400).json({ error: `Poin kelas ${studentClass.name} tidak mencukupi untuk item ini.` });
      }

      if (studentClass.pointPerilaku >= cost) {
        studentClass.pointPerilaku -= cost;
      } else {
        const diff = cost - studentClass.pointPerilaku;
        studentClass.pointPerilaku = 0;
        studentClass.pointKebersihan = Math.max(0, studentClass.pointKebersihan - diff);
      }
    }

    reward.stock -= 1;

    // Create redemption log
    const logId = `log_${Date.now()}`;
    const newLog = {
      id: logId,
      studentId: user.id,
      studentName: user.name,
      kelasId: user.kelasId,
      type: "sopan" as const,
      points: -cost,
      description: `Menukar Poin: ${reward.title}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      giverName: "Toko Reward",
      isVerified: true
    };

    db.logs.unshift(newLog);
    saveDB(db);

    res.json({ success: true, user, reward });
  });

  // Submit Character Quiz
  app.post("/api/quiz/submit", (req, res) => {
    const { userId, quizId, isCorrect } = req.body;
    const db = loadDB();

    const user = db.users.find(u => u.id === userId);
    const quiz = db.quizzes.find(q => q.id === quizId);

    if (!user || !quiz) {
      return res.status(404).json({ error: "User atau Kuis tidak ditemukan." });
    }

    if (isCorrect) {
      // Reward character points for solving quiz
      const pts = quiz.pointsReward;
      user.pointSopan += pts;
      
      const stClass = db.classes.find(c => c.id === user.kelasId);
      if (stClass) {
        stClass.pointPerilaku += pts;
      }

      // Add log
      const logId = `log_${Date.now()}`;
      db.logs.unshift({
        id: logId,
        studentId: user.id,
        studentName: user.name,
        kelasId: user.kelasId,
        type: "etika",
        points: pts,
        description: `Menyelesaikan Kuis Etika: "${quiz.question.slice(0, 30)}..."`,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        giverName: "Kuis Karakter",
        isVerified: true
      });

      saveDB(db);
      res.json({ success: true, user, message: `Bagus sekali! Jawaban Anda benar. Anda mendapatkan +${pts} Poin Sopan!` });
    } else {
      res.json({ success: false, message: "Jawaban Anda kurang tepat. Silahkan baca kembali nasehat materi etika dan coba lagi." });
    }
  });

  // Add customized system ethics quote generator via Gemini 3.5
  app.post("/api/ai/advice", async (req, res) => {
    const { category, customTopic } = req.body;
    if (!ai) {
      return res.json({
        advice: `Pendidikan Karakter (${category || "Utama"}): Saling menyapa dengan senyum tulus, menghargai sesama teman sebangku, serta menjaga kebiasaan luhur adalah kunci membentuk budaya sekolah ramah anak. Mari penuhi hari ini dengan kebaikan yang ikhlas.`
      });
    }

    try {
      const prompt = `Buatkan sebuah artikel penyemangat etika, tata krama, kesopanan, atau nasihat anti-bullying sekolah bertema "${category || "Etika Umum"}" ${customTopic ? `dengan topik spesifik: "${customTopic}"` : ""}. Tulislah dalam Bahasa Indonesia yang keren, modern, sangat menyentuh hati anak SMP/SMA, berikan 3 solusi etis yang praktis dan inspiratif, serta berikan kutipan/quotes penyemangat di bagian akhir. Format dalam bentuk tulisan paragraf pendek, mudah dibaca, tanpa markdown tebal kecuali list bullet point solusi.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah Ibu Hermin, Guru BK yang paling disukai oleh murid-murid di sekolah karena ramah, puitis, dan bijaksana. Gaya bahasa Anda bersahabat, penuh rasa empati, dan menggunakan diksi remaja yang sopan."
        }
      });

      res.json({ advice: response.text });
    } catch (e: any) {
      console.error("Gemini API call failed:", e);
      res.json({
        advice: `Pendidikan Karakter (${category || "Utama"}): Saling menyapa dengan senyum tulus, menghargai sesama teman sebangku, serta menjaga kebiasaan luhur adalah kunci membentuk budaya sekolah ramah anak. Mari penuhi hari ini dengan kebaikan yang ikhlas (Gagal memuat AI: ${e.message})`
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
