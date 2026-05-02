require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// We'll require models from parent directory
const User = require('../models/User');
const Note = require('../models/Note');

const seed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }

    // Clear existing data
    await User.deleteMany({});
    await Note.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@notes.com',
      password: 'admin123',
      role: 'admin',
      branch: 'CSE',
      semester: 8,
    });

    // Create regular users
    const user1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'password123',
      branch: 'CSE',
      semester: 5,
    });

    const user2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'password123',
      branch: 'ECE',
      semester: 4,
    });

    console.log('👤 Users created');

    // Create demo notes
    const notes = await Note.insertMany([
      // CSE
      {
        title: 'Eloquent JavaScript',
        description: 'The complete Eloquent JavaScript book by Marijn Haverbeke. Covers basics, DOM, and Node.js.',
        subject: 'Web Development',
        branch: 'CSE',
        semester: 4,
        tags: ['javascript', 'web', 'programming'],
        fileUrl: 'https://eloquentjavascript.net/Eloquent_JavaScript.pdf',
        fileType: 'pdf',
        fileName: 'Eloquent_JavaScript.pdf',
        fileSize: 4500000,
        uploader: user1._id,
        downloadCount: 142,
        ratings: [{ user: user2._id, value: 5 }, { user: admin._id, value: 4 }],
      },
      {
        title: 'Think Python 2nd Edition',
        description: 'Comprehensive introduction to Python programming by Allen B. Downey.',
        subject: 'Python Programming',
        branch: 'CSE',
        semester: 2,
        tags: ['python', 'basics', 'programming'],
        fileUrl: 'https://greenteapress.com/thinkpython2/thinkpython2.pdf',
        fileType: 'pdf',
        fileName: 'thinkpython2.pdf',
        fileSize: 2200000,
        uploader: admin._id,
        downloadCount: 310,
        ratings: [{ user: user1._id, value: 5 }, { user: user2._id, value: 4 }],
      },
      {
        title: 'Data Structures Compendium',
        description: 'A complete overview of Data Structures (derived from Wikipedia).',
        subject: 'Data Structures',
        branch: 'CSE',
        semester: 3,
        tags: ['algorithms', 'structures'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Data_structure',
        fileType: 'pdf',
        fileName: 'Data_structure.pdf',
        fileSize: 1500000,
        uploader: user2._id,
        downloadCount: 87,
        ratings: [{ user: user1._id, value: 4 }],
      },
      {
        title: 'Operating Systems Guide',
        description: 'Comprehensive guide to Operating Systems concepts (derived from Wikipedia).',
        subject: 'Operating Systems',
        branch: 'CSE',
        semester: 5,
        tags: ['os', 'system', 'memory'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Operating_system',
        fileType: 'pdf',
        fileName: 'Operating_system.pdf',
        fileSize: 1800000,
        uploader: admin._id,
        downloadCount: 120,
        ratings: [],
      },

      // ECE
      {
        title: 'Digital Electronics Fundamentals',
        description: 'A detailed overview of Digital Electronics and Logic Gates (Wikipedia).',
        subject: 'Digital Electronics',
        branch: 'ECE',
        semester: 3,
        tags: ['logic-gates', 'electronics'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Digital_electronics',
        fileType: 'pdf',
        fileName: 'Digital_electronics.pdf',
        fileSize: 1200000,
        uploader: user1._id,
        downloadCount: 45,
        ratings: [{ user: admin._id, value: 4 }],
      },
      {
        title: 'Microprocessors Reference',
        description: 'Complete architecture and history of Microprocessors.',
        subject: 'Microprocessors',
        branch: 'ECE',
        semester: 5,
        tags: ['cpu', 'hardware'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Microprocessor',
        fileType: 'pdf',
        fileName: 'Microprocessor.pdf',
        fileSize: 1400000,
        uploader: user2._id,
        downloadCount: 92,
        ratings: [{ user: user1._id, value: 3 }],
      },

      // ME (Mechanical)
      {
        title: 'Thermodynamics Principles',
        description: 'Full overview of the laws of Thermodynamics and their applications.',
        subject: 'Thermodynamics',
        branch: 'ME',
        semester: 3,
        tags: ['physics', 'heat', 'energy'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Thermodynamics',
        fileType: 'pdf',
        fileName: 'Thermodynamics.pdf',
        fileSize: 1600000,
        uploader: admin._id,
        downloadCount: 78,
        ratings: [],
      },
      {
        title: 'Fluid Mechanics Overview',
        description: 'Comprehensive mechanical engineering notes on fluid dynamics.',
        subject: 'Fluid Mechanics',
        branch: 'ME',
        semester: 4,
        tags: ['fluids', 'dynamics'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Fluid_mechanics',
        fileType: 'pdf',
        fileName: 'Fluid_mechanics.pdf',
        fileSize: 1700000,
        uploader: user1._id,
        downloadCount: 112,
        ratings: [{ user: user2._id, value: 5 }],
      },

      // CE (Civil)
      {
        title: 'Structural Engineering',
        description: 'Civil engineering material detailing structural analysis and engineering.',
        subject: 'Structural Engineering',
        branch: 'CE',
        semester: 4,
        tags: ['structures', 'civil'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Structural_engineering',
        fileType: 'pdf',
        fileName: 'Structural_engineering.pdf',
        fileSize: 1900000,
        uploader: user2._id,
        downloadCount: 65,
        ratings: [{ user: admin._id, value: 4 }],
      },
      {
        title: 'Geotechnical Engineering',
        description: 'Study of soil mechanics and foundation engineering.',
        subject: 'Geotechnical Engineering',
        branch: 'CE',
        semester: 6,
        tags: ['soil', 'mechanics'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Geotechnical_engineering',
        fileType: 'pdf',
        fileName: 'Geotechnical_engineering.pdf',
        fileSize: 2100000,
        uploader: admin._id,
        downloadCount: 88,
        ratings: [],
      },

      // AIML
      {
        title: 'Stanford CS229: Machine Learning',
        description: 'Supervised learning notes directly from Stanford CS229.',
        subject: 'Machine Learning',
        branch: 'AIML',
        semester: 6,
        tags: ['machine-learning', 'cs229'],
        fileUrl: 'https://cs229.stanford.edu/notes2020spring/cs229-notes1.pdf',
        fileType: 'pdf',
        fileName: 'cs229-notes1.pdf',
        fileSize: 1800000,
        uploader: user1._id,
        downloadCount: 420,
        ratings: [{ user: user2._id, value: 5 }, { user: admin._id, value: 5 }],
      },
      {
        title: 'Stanford CS224n: Word Vectors',
        description: 'Notes on word representations and NLP from Stanford.',
        subject: 'Natural Language Processing',
        branch: 'AIML',
        semester: 7,
        tags: ['nlp', 'word2vec', 'cs224n'],
        fileUrl: 'https://web.stanford.edu/class/cs224n/readings/cs224n-2019-notes01-wordvecs1.pdf',
        fileType: 'pdf',
        fileName: 'cs224n-2019-notes01-wordvecs1.pdf',
        fileSize: 1200000,
        uploader: user2._id,
        downloadCount: 375,
        ratings: [{ user: user1._id, value: 5 }],
      },
      {
        title: 'Deep Learning Handbook',
        description: 'An expansive overview of deep neural networks.',
        subject: 'Deep Learning',
        branch: 'AIML',
        semester: 7,
        tags: ['deep-learning', 'neural-networks'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Deep_learning',
        fileType: 'pdf',
        fileName: 'Deep_learning.pdf',
        fileSize: 2500000,
        uploader: admin._id,
        downloadCount: 190,
        ratings: [{ user: user1._id, value: 4 }],
      },
      {
        title: 'Artificial Intelligence Guide',
        description: 'A complete overview of the field of Artificial Intelligence.',
        subject: 'Artificial Intelligence',
        branch: 'AIML',
        semester: 5,
        tags: ['ai', 'intelligence'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Artificial_intelligence',
        fileType: 'pdf',
        fileName: 'Artificial_intelligence.pdf',
        fileSize: 2600000,
        uploader: user1._id,
        downloadCount: 215,
        ratings: [{ user: user2._id, value: 5 }],
      },

      // IT
      {
        title: 'Cloud Computing Infrastructure',
        description: 'Introductory material on cloud architecture and virtualization.',
        subject: 'Cloud Computing',
        branch: 'IT',
        semester: 6,
        tags: ['cloud', 'virtualization'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Cloud_computing',
        fileType: 'pdf',
        fileName: 'Cloud_computing.pdf',
        fileSize: 1950000,
        uploader: user2._id,
        downloadCount: 145,
        ratings: [{ user: admin._id, value: 4 }],
      },
      {
        title: 'Computer Networks Protocol',
        description: 'Comprehensive guide to network layers, protocols, and routing.',
        subject: 'Computer Networks',
        branch: 'IT',
        semester: 5,
        tags: ['networks', 'osi'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Computer_network',
        fileType: 'pdf',
        fileName: 'Computer_network.pdf',
        fileSize: 2200000,
        uploader: admin._id,
        downloadCount: 178,
        ratings: [{ user: user1._id, value: 5 }],
      },
      {
        title: 'Software Engineering Principles',
        description: 'Guide covering software development life cycles and methodologies.',
        subject: 'Software Engineering',
        branch: 'IT',
        semester: 4,
        tags: ['sdlc', 'engineering'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Software_engineering',
        fileType: 'pdf',
        fileName: 'Software_engineering.pdf',
        fileSize: 2050000,
        uploader: user1._id,
        downloadCount: 160,
        ratings: [{ user: user2._id, value: 4 }],
      },
      {
        title: 'Database Management Systems',
        description: 'Complete database concepts, SQL, and normalization.',
        subject: 'DBMS',
        branch: 'IT',
        semester: 4,
        tags: ['sql', 'database'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Database',
        fileType: 'pdf',
        fileName: 'Database.pdf',
        fileSize: 1850000,
        uploader: user2._id,
        downloadCount: 130,
        ratings: [],
      },

      // EEE
      {
        title: 'Control Systems & Theory',
        description: 'In-depth notes on stability analysis and control theory.',
        subject: 'Control Systems',
        branch: 'EEE',
        semester: 4,
        tags: ['control', 'stability'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Control_theory',
        fileType: 'pdf',
        fileName: 'Control_theory.pdf',
        fileSize: 1750000,
        uploader: admin._id,
        downloadCount: 88,
        ratings: [{ user: user1._id, value: 3 }],
      },
      {
        title: 'Electrical Circuit Theory',
        description: 'Notes on circuit analysis, Kirchhoff laws, and AC circuits.',
        subject: 'Circuit Theory',
        branch: 'EEE',
        semester: 2,
        tags: ['circuits', 'electrical'],
        fileUrl: 'https://en.wikipedia.org/api/rest_v1/page/pdf/Electrical_network',
        fileType: 'pdf',
        fileName: 'Electrical_network.pdf',
        fileSize: 1950000,
        uploader: user1._id,
        downloadCount: 105,
        ratings: [{ user: user2._id, value: 4 }],
      }
    ]);

    // Update average ratings
    for (const note of notes) {
      const found = await Note.findById(note._id);
      found.updateAverageRating();
      await found.save();
    }

    console.log('📚 Notes created');
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('   Admin: admin@notes.com / admin123');
    console.log('   User 1: rahul@example.com / password123');
    console.log('   User 2: priya@example.com / password123');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seed();
}

module.exports = seed;
