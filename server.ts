import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  User, 
  Issue, 
  Notification, 
  Department, 
  Verification, 
  AIAnalysis, 
  PredictiveAlert,
  IssueCategory
} from './src/types';

// Load environment variables
dotenv.config();

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const hasGeminiKey = Boolean(geminiApiKey) && geminiApiKey !== 'MY_GEMINI_API_KEY';

let ai: GoogleGenAI | null = null;
if (hasGeminiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Ensure the data directory exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed data
const initialState = {
  users: [
    {
      uid: 'citizen-demo',
      name: 'Amit Roy',
      email: 'citizen@civix.ai',
      role: 'citizen',
      points: 120,
      badge: 'City Guardian',
      ward: 'Ward 12 - Indiranagar',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      uid: 'authority-demo',
      name: 'Officer Mehta',
      email: 'authority@civix.ai',
      role: 'authority',
      points: 0,
      badge: 'Civic Helper',
      ward: 'Municipal HQ',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      uid: 'admin-demo',
      name: 'Super Admin',
      email: 'admin@civix.ai',
      role: 'admin',
      points: 500,
      badge: 'Community Hero',
      ward: 'Central Administration',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ] as User[],
  issues: [
    {
      id: 'issue-1',
      title: 'Major Pothole on Indiranagar 100 Feet Road',
      description: 'A deep pothole has formed right in the middle of the road, causing severe bike accidents at night. It is right after the traffic signal.',
      category: 'Roads',
      severity: 'High',
      severityScore: 78,
      status: 'In Progress',
      address: '100 Feet Rd, Hal 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
      ward: 'Ward 12 - Indiranagar',
      landmark: 'Opposite Toit Brewpub',
      latitude: 12.9716,
      longitude: 77.5946,
      department: 'Road & Infrastructure Department',
      reportedBy: 'citizen-demo',
      reporterName: 'Amit Roy',
      verifications: { yes: 18, no: 1 },
      verifiedBy: ['citizen-demo'],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 0,
      comments: [
        {
          id: 'c1',
          userId: 'authority-demo',
          userName: 'Officer Mehta',
          text: 'Department has acknowledged the issue. Inspection team is visiting tomorrow.',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
          isOfficial: true,
        }
      ],
    },
    {
      id: 'issue-2',
      title: 'Garbage Dump near Indiranagar Park',
      description: 'Uncontrolled garbage disposal along the park boundary wall. Stench is unbearable, and stray dogs are gathered everywhere.',
      category: 'Waste',
      severity: 'Medium',
      severityScore: 52,
      status: 'Reported',
      address: '1st Cross Rd, Stage 2, Indiranagar, Bengaluru, Karnataka 560008',
      ward: 'Ward 12 - Indiranagar',
      landmark: 'Next to Indiranagar Public Park',
      latitude: 12.9730,
      longitude: 77.6400,
      department: 'Sanitation & Waste Management Department',
      reportedBy: 'citizen-demo',
      reporterName: 'Amit Roy',
      verifications: { yes: 8, no: 0 },
      verifiedBy: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 0,
      comments: [],
    },
    {
      id: 'issue-3',
      title: 'Water Pipeline Leakage on Double Road',
      description: 'Drinking water is gushing out of the main pipe under the footpath, flooding the road and wasting precious water.',
      category: 'Water',
      severity: 'High',
      severityScore: 82,
      status: 'Resolved',
      address: 'Indiranagar Double Rd, Eshwara Layout, Bengaluru, Karnataka 560038',
      ward: 'Ward 12 - Indiranagar',
      landmark: 'Near Eshwara Temple',
      latitude: 12.9680,
      longitude: 77.6350,
      department: 'Water & Sewerage Department',
      reportedBy: 'citizen-demo',
      reporterName: 'Amit Roy',
      verifications: { yes: 24, no: 0 },
      verifiedBy: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 0,
      comments: [
        {
          id: 'c2',
          userId: 'authority-demo',
          userName: 'Officer Mehta',
          text: 'Pipe sealing team successfully completed the welding work. Water flow restored.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isOfficial: true,
        }
      ],
    },
    {
      id: 'issue-4',
      title: 'Damaged Electric Pole Bending Over',
      description: 'The concrete electric pole is cracked and dangerously tilting toward the main street. Heavy wires are hanging low.',
      category: 'Electricity',
      severity: 'Critical',
      severityScore: 94,
      status: 'Assigned',
      address: 'Appareddypalya, Indiranagar, Bengaluru, Karnataka 560038',
      ward: 'Ward 12 - Indiranagar',
      landmark: 'Near Metro Pillar 110',
      latitude: 12.9750,
      longitude: 77.6300,
      department: 'Electricity & Lighting Department',
      reportedBy: 'citizen-demo',
      reporterName: 'Amit Roy',
      verifications: { yes: 35, no: 2 },
      verifiedBy: [],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 1, // Escalated due to 8 days delay on a Critical issue
      comments: [],
    },
    {
      id: 'issue-5',
      title: 'Open Manhole without Warning Sign',
      description: 'A storm drain manhole cover is completely missing on a busy pedestrian walkway, highly dangerous for kids and pedestrians.',
      category: 'Public Safety',
      severity: 'Critical',
      severityScore: 96,
      status: 'Reported',
      address: 'Defense Colony, Indiranagar, Bengaluru, Karnataka 560038',
      ward: 'Ward 12 - Indiranagar',
      landmark: 'Opposite Defense Colony Childrens Park',
      latitude: 12.9780,
      longitude: 77.6430,
      department: 'Public Safety & Emergency Department',
      reportedBy: 'citizen-demo',
      reporterName: 'Amit Roy',
      verifications: { yes: 14, no: 0 },
      verifiedBy: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      escalationLevel: 0,
      comments: [],
    }
  ] as Issue[],
  notifications: [
    {
      id: 'n-1',
      userId: 'citizen-demo',
      title: 'Issue Resolved! 🎉',
      message: 'Your report "Water Pipeline Leakage on Double Road" has been successfully resolved.',
      type: 'status_update',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      issueId: 'issue-3',
    },
    {
      id: 'n-2',
      userId: 'citizen-demo',
      title: 'Points Earned!',
      message: 'You earned 15 points for helping resolve a civic issue!',
      type: 'status_update',
      read: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      issueId: 'issue-3',
    },
    {
      id: 'n-3',
      userId: 'authority-demo',
      title: 'Critical Escalation Alert',
      message: 'Issue #issue-4 "Damaged Electric Pole Bending Over" has been escalated to Level 1 due to delay.',
      type: 'escalation',
      read: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      issueId: 'issue-4',
    }
  ] as Notification[],
  departments: [
    {
      id: 'dept-roads',
      name: 'Road & Infrastructure Department',
      category: 'Roads',
      head: 'Pradeep Kumar',
      contact: '+91 98765 43210',
      totalAssigned: 1,
      totalResolved: 0,
    },
    {
      id: 'dept-water',
      name: 'Water & Sewerage Department',
      category: 'Water',
      head: 'Ananya Sharma',
      contact: '+91 98765 43211',
      totalAssigned: 1,
      totalResolved: 1,
    },
    {
      id: 'dept-waste',
      name: 'Sanitation & Waste Management Department',
      category: 'Waste',
      head: 'Ravi Verma',
      contact: '+91 98765 43212',
      totalAssigned: 1,
      totalResolved: 0,
    },
    {
      id: 'dept-elec',
      name: 'Electricity & Lighting Department',
      category: 'Electricity',
      head: 'Sanjay Sen',
      contact: '+91 98765 43213',
      totalAssigned: 1,
      totalResolved: 0,
    },
    {
      id: 'dept-safety',
      name: 'Public Safety & Emergency Department',
      category: 'Public Safety',
      head: 'Amit Patel',
      contact: '+91 98765 43214',
      totalAssigned: 1,
      totalResolved: 0,
    }
  ] as Department[],
  verifications: [] as Verification[],
};

// Load database or seed it
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (err) {
      console.error('Error parsing db file, resetting with seed data:', err);
      return initialState;
    }
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2));
    return initialState;
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Haversine formula to compute distance in meters
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// -------------------------------------------------------------
// MAIN SERVER ENTRY
// -------------------------------------------------------------
async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '25mb' }));

  // Database helper
  const getDB = () => loadDB();

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey });
  });

  // Get full state (for easy initial hydration / syncing)
  app.get('/api/state', (req, res) => {
    res.json(getDB());
  });

  // User Auth - Register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, ward } = req.body;
    const dbData = getDB();

    let user = dbData.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser: User = {
      uid: 'user-' + Math.random().toString(36).substring(2, 11),
      name,
      email,
      role: role || 'citizen',
      points: 10, // Welcome points
      badge: 'Civic Helper',
      ward: ward || 'Ward 12 - Indiranagar',
      createdAt: new Date().toISOString(),
    };

    dbData.users.push(newUser);
    saveDB(dbData);
    res.json(newUser);
  });

  // User Auth - Login (returns user details)
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const dbData = getDB();

    let user = dbData.users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Create user automatically as a convenience for demo auth
      const isAuthority = email.endsWith('@civix.ai') && email.includes('authority');
      const isAdmin = email.endsWith('@civix.ai') && email.includes('admin');
      
      const defaultName = email.split('@')[0].split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

      user = {
        uid: 'user-' + Math.random().toString(36).substring(2, 11),
        name: defaultName || 'Anonymous',
        email,
        role: isAdmin ? 'admin' : (isAuthority ? 'authority' : 'citizen'),
        points: 10,
        badge: 'Civic Helper',
        ward: 'Ward 12 - Indiranagar',
        createdAt: new Date().toISOString(),
      };
      dbData.users.push(user);
      saveDB(dbData);
    }

    res.json(user);
  });

  // Create Issue
  app.post('/api/issues', async (req, res) => {
    const { 
      title, 
      description, 
      category, 
      severity, 
      latitude, 
      longitude, 
      address, 
      ward, 
      landmark, 
      reportedBy, 
      reporterName, 
      imageUrl,
      aiAnalysis 
    } = req.body;

    const dbData = getDB();

    // 1. DUPLICATE DETECTION AGENT
    const isDuplicateThresholdMeters = 100;
    const duplicate = dbData.issues.find((issue: Issue) => {
      if (issue.status === 'Resolved') return false;
      if (issue.category !== category) return false;
      const distance = getHaversineDistance(
        latitude, 
        longitude, 
        issue.latitude, 
        issue.longitude
      );
      return distance < isDuplicateThresholdMeters;
    });

    if (duplicate) {
      // Increment duplicate / verifications
      duplicate.verifications.yes += 1;
      if (!duplicate.verifiedBy.includes(reportedBy)) {
        duplicate.verifiedBy.push(reportedBy);
      }
      duplicate.updatedAt = new Date().toISOString();

      // Award points for verification
      const user = dbData.users.find((u: User) => u.uid === reportedBy);
      if (user) {
        user.points += 5; // 5 pts for verification
        if (user.points >= 301) user.badge = 'Community Hero';
        else if (user.points >= 101) user.badge = 'City Guardian';
      }

      // Add a notification for duplicate reporter
      const notif: Notification = {
        id: 'n-' + Math.random().toString(36).substring(2, 11),
        userId: reportedBy,
        title: 'Similar Issue Active Nearby 📍',
        message: `A similar issue "${duplicate.title}" was already reported nearby. Your report has been merged as a community verification vote.`,
        type: 'verification_request',
        read: false,
        createdAt: new Date().toISOString(),
        issueId: duplicate.id,
      };
      dbData.notifications.push(notif);

      saveDB(dbData);

      return res.json({ 
        isDuplicate: true, 
        originalId: duplicate.id, 
        message: 'A similar issue was already reported nearby. Your report was added as an upvote/verification.' 
      });
    }

    // 2. SEVERITY SCORE CALCULATOR AGENT
    const baseScores: Record<string, number> = { Low: 20, Medium: 45, High: 72, Critical: 92 };
    let score = baseScores[severity] || 50;
    if (category === 'Public Safety') score += 10;
    if (category === 'Roads') score += 5;
    // Cap at 100
    score = Math.min(100, Math.max(0, score));

    // 3. DEPARTMENT ROUTING AGENT
    const DEPARTMENT_MAP: Record<string, string> = {
      "Roads": "Road & Infrastructure Department",
      "Water": "Water & Sewerage Department", 
      "Electricity": "Electricity & Lighting Department",
      "Waste": "Sanitation & Waste Management Department",
      "Public Safety": "Public Safety & Emergency Department"
    };
    const assignedDeptName = DEPARTMENT_MAP[category] || "General Administration";
    const dept = dbData.departments.find((d: Department) => d.name === assignedDeptName);
    if (dept) {
      dept.totalAssigned += 1;
    }

    const newIssueId = 'issue-' + Math.random().toString(36).substring(2, 11);
    const newIssue: Issue = {
      id: newIssueId,
      title,
      description,
      category,
      severity,
      severityScore: score,
      status: 'Reported',
      imageUrl: imageUrl || '',
      latitude,
      longitude,
      address: address || 'Indiranagar, Bengaluru, Karnataka, India',
      ward: ward || 'Ward 12 - Indiranagar',
      landmark: landmark || '',
      department: assignedDeptName,
      reportedBy,
      reporterName,
      verifications: { yes: 1, no: 0 },
      verifiedBy: [reportedBy],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiAnalysis,
      escalationLevel: 0,
      comments: [],
    };

    dbData.issues.push(newIssue);

    // Award points to reporter
    const user = dbData.users.find((u: User) => u.uid === reportedBy);
    if (user) {
      user.points += 10; // 10 pts for submitting report
      if (user.points >= 301) user.badge = 'Community Hero';
      else if (user.points >= 101) user.badge = 'City Guardian';
    }

    // Create system notification
    const newNotif: Notification = {
      id: 'n-' + Math.random().toString(36).substring(2, 11),
      userId: reportedBy,
      title: 'Issue Submitted Successfully! 📝',
      message: `Your report "${title}" has been successfully logged. Routing to: ${assignedDeptName}.`,
      type: 'new_issue',
      read: false,
      createdAt: new Date().toISOString(),
      issueId: newIssueId,
    };
    dbData.notifications.push(newNotif);

    saveDB(dbData);
    res.json({ isDuplicate: false, issue: newIssue });
  });

  // Verify / Upvote Issue
  app.post('/api/issues/:id/verify', (req, res) => {
    const { id } = req.params;
    const { userId, vote } = req.body; // vote: 'yes' | 'no'
    const dbData = getDB();

    const issue = dbData.issues.find((i: Issue) => i.id === id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    if (issue.verifiedBy.includes(userId)) {
      return res.status(400).json({ error: 'You have already verified this issue' });
    }

    issue.verifiedBy.push(userId);
    if (vote === 'yes') {
      issue.verifications.yes += 1;
    } else {
      issue.verifications.no += 1;
    }
    issue.updatedAt = new Date().toISOString();

    // Auto-verify threshold logic
    if (issue.status === 'Reported' && issue.verifications.yes >= 5) {
      issue.status = 'Verified';
      
      // Notify reporter
      const notif: Notification = {
        id: 'n-' + Math.random().toString(36).substring(2, 11),
        userId: issue.reportedBy,
        title: 'Community Verified! 👥',
        message: `Your report "${issue.title}" has received over 5 community upvotes and is now officially verified.`,
        type: 'status_update',
        read: false,
        createdAt: new Date().toISOString(),
        issueId: issue.id,
      };
      dbData.notifications.push(notif);
    }

    // Award 5 points for verifying
    const user = dbData.users.find((u: User) => u.uid === userId);
    if (user) {
      user.points += 5;
      if (user.points >= 301) user.badge = 'Community Hero';
      else if (user.points >= 101) user.badge = 'City Guardian';
    }

    saveDB(dbData);
    res.json(issue);
  });

  // Update Issue Status (Authority Action)
  app.post('/api/issues/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, commentText, authorityUserId, authorityUserName } = req.body;
    const dbData = getDB();

    const issue = dbData.issues.find((i: Issue) => i.id === id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const oldStatus = issue.status;
    issue.status = status;
    issue.updatedAt = new Date().toISOString();

    if (status === 'Resolved') {
      issue.resolvedAt = new Date().toISOString();

      // Update Department Resolved count
      const dept = dbData.departments.find((d: Department) => d.name === issue.department);
      if (dept) {
        dept.totalResolved += 1;
      }

      // Award reporter 15 points
      const reporter = dbData.users.find((u: User) => u.uid === issue.reportedBy);
      if (reporter) {
        reporter.points += 15;
        if (reporter.points >= 301) reporter.badge = 'Community Hero';
        else if (reporter.points >= 101) reporter.badge = 'City Guardian';

        // Add points notification
        dbData.notifications.push({
          id: 'n-' + Math.random().toString(36).substring(2, 11),
          userId: issue.reportedBy,
          title: 'Points Earned! +15 PTS 🏆',
          message: `Your report "${issue.title}" has been completed! You earned 15 points. Thank you for making the city safer!`,
          type: 'status_update',
          read: false,
          createdAt: new Date().toISOString(),
          issueId: issue.id,
        });
      }
    }

    // Add comment
    if (commentText) {
      issue.comments.push({
        id: 'c-' + Math.random().toString(36).substring(2, 11),
        userId: authorityUserId,
        userName: authorityUserName,
        text: commentText,
        createdAt: new Date().toISOString(),
        isOfficial: true,
      });
    }

    // Status change notification for reporter
    dbData.notifications.push({
      id: 'n-' + Math.random().toString(36).substring(2, 11),
      userId: issue.reportedBy,
      title: `Status Update: ${status} ⚙️`,
      message: `Your reported issue "${issue.title}" has moved from ${oldStatus} to ${status}.`,
      type: 'status_update',
      read: false,
      createdAt: new Date().toISOString(),
      issueId: issue.id,
    });

    saveDB(dbData);
    res.json(issue);
  });

  // Add Comment
  app.post('/api/issues/:id/comments', (req, res) => {
    const { id } = req.params;
    const { userId, userName, text, isOfficial } = req.body;
    const dbData = getDB();

    const issue = dbData.issues.find((i: Issue) => i.id === id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const newComment = {
      id: 'c-' + Math.random().toString(36).substring(2, 11),
      userId,
      userName,
      text,
      createdAt: new Date().toISOString(),
      isOfficial: isOfficial || false,
    };

    issue.comments.push(newComment);
    issue.updatedAt = new Date().toISOString();

    saveDB(dbData);
    res.json(newComment);
  });

  // Mark notifications as read
  app.post('/api/notifications/read-all', (req, res) => {
    const { userId } = req.body;
    const dbData = getDB();

    dbData.notifications.forEach((n: Notification) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });

    saveDB(dbData);
    res.json({ success: true });
  });

  // -------------------------------------------------------------
  // AI AGENTS VIA GEMINI
  // -------------------------------------------------------------

  // Agent 1: Vision AI Agent
  app.post('/api/gemini/analyze-image', async (req, res) => {
    const { base64Image, mimeType } = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    if (!hasGeminiKey || !ai) {
      // Fallback response for offline / missing key
      const mockResult: AIAnalysis = {
        issue: 'Pothole',
        category: 'Roads',
        severity: 'High',
        severityScore: 78,
        confidence: 90,
        description: 'Large asphalt damage detected. Pothole is deep and filled with water, posing a severe hazard to two-wheelers and traffic flow.',
        urgency: 'Immediate',
        estimatedRepairTime: '2 days',
        riskFactors: ['Accident Risk', 'Vehicle Damage'],
        suggestedTitle: 'Hazardous Pothole on main lane'
      };
      return res.json({ analysis: mockResult, fallback: true });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Image
            }
          },
          `You are a professional civil issue detection AI. Analyze this image of a public infrastructure problem.

Return ONLY a valid JSON object with exactly these fields:
{
  "issue": "specific issue name (e.g. Pothole, Broken Streetlight, Water Leakage, Garbage Overflow, Open Manhole, Damaged Traffic Signal, Cracked Road, Flooding)",
  "category": "Roads | Water | Electricity | Waste | Public Safety",
  "severity": "Low | Medium | High | Critical",
  "severityScore": <number 0-100>,
  "confidence": <number 0-100>,
  "description": "detailed 2-sentence description of what you see and why it is a hazard",
  "urgency": "Immediate | Soon | Scheduled",
  "estimatedRepairTime": "string like '2-3 days' or '1 week'",
  "riskFactors": ["factor1", "factor2"],
  "suggestedTitle": "concise issue title under 60 chars"
}

No markdown. No extra explanation. Pure JSON code only.`
        ],
        config: {
          responseMimeType: 'application/json',
        }
      });

      const text = response.text || '';
      const cleaned = text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      const parsedAnalysis = JSON.parse(cleaned) as AIAnalysis;
      res.json({ analysis: parsedAnalysis });
    } catch (err: any) {
      console.error('Gemini Vision AI error:', err);
      // Fail gracefully with standard classification
      res.status(500).json({ error: 'AI Analysis failed', details: err.message });
    }
  });

  // Agent 7: Escalation Agent
  app.post('/api/escalations/check', (req, res) => {
    const dbData = getDB();
    const now = Date.now();
    let escalatedCount = 0;

    dbData.issues.forEach((issue: Issue) => {
      if (issue.status === 'Resolved') return;

      const createdTime = new Date(issue.createdAt).getTime();
      const daysOpen = (now - createdTime) / (1000 * 60 * 60 * 24);

      if (daysOpen >= 30 && issue.escalationLevel < 2) {
        issue.escalationLevel = 2;
        issue.severity = 'Critical';
        issue.severityScore = Math.max(issue.severityScore, 95);
        escalatedCount++;

        // Send alert notification to Authority
        dbData.notifications.push({
          id: 'n-' + Math.random().toString(36).substring(2, 11),
          userId: 'authority-demo',
          title: '⚠️ CRITICAL ESCO LEVEL 2',
          message: `Issue "${issue.title}" is overdue by 30+ days. Escalated to Senior Executive level.`,
          type: 'escalation',
          read: false,
          createdAt: new Date().toISOString(),
          issueId: issue.id,
        });
      } else if (daysOpen >= 14 && issue.escalationLevel < 1) {
        issue.escalationLevel = 1;
        issue.severityScore = Math.min(100, issue.severityScore + 10);
        escalatedCount++;

        dbData.notifications.push({
          id: 'n-' + Math.random().toString(36).substring(2, 11),
          userId: 'authority-demo',
          title: '⚠️ OVERDUE ESCO LEVEL 1',
          message: `Issue "${issue.title}" has been open for over 14 days. Escalated to department head.`,
          type: 'escalation',
          read: false,
          createdAt: new Date().toISOString(),
          issueId: issue.id,
        });
      } else if (daysOpen >= 7 && issue.status === 'Assigned') {
        // Mark as overdue status
        dbData.notifications.push({
          id: 'n-' + Math.random().toString(36).substring(2, 11),
          userId: 'authority-demo',
          title: '⏰ Action Required: Overdue',
          message: `Assigned issue "${issue.title}" has had no status update in 7 days.`,
          type: 'escalation',
          read: false,
          createdAt: new Date().toISOString(),
          issueId: issue.id,
        });
      }
    });

    if (escalatedCount > 0) {
      saveDB(dbData);
    }

    res.json({ success: true, escalatedCount });
  });

  // Agent 8: Predictive Infrastructure Risks Agent
  app.get('/api/gemini/predict', async (req, res) => {
    const dbData = getDB();

    // Perform density grid analysis (grouping by Category + Ward/Geographic clustering)
    // Here we cluster issues within 500 meters of each other
    const issues = dbData.issues.filter((i: Issue) => i.status !== 'Resolved');
    
    // Quick grouping
    const hotspots: Record<string, { category: IssueCategory; count: number; ward: string; coordinates: {lat: number; lng: number}[] }> = {};
    
    issues.forEach((i: Issue) => {
      // Find a near cluster
      let foundKey = '';
      for (const key in hotspots) {
        const cluster = hotspots[key];
        if (cluster.category === i.category) {
          const distance = getHaversineDistance(i.latitude, i.longitude, cluster.coordinates[0].lat, cluster.coordinates[0].lng);
          if (distance <= 500) {
            foundKey = key;
            break;
          }
        }
      }

      if (foundKey) {
        hotspots[foundKey].count += 1;
        hotspots[foundKey].coordinates.push({ lat: i.latitude, lng: i.longitude });
      } else {
        const newKey = `${i.category}-${Math.random().toString(36).substring(2, 7)}`;
        hotspots[newKey] = {
          category: i.category,
          count: 1,
          ward: i.ward,
          coordinates: [{ lat: i.latitude, lng: i.longitude }]
        };
      }
    });

    const activeClusters = Object.values(hotspots).map(c => ({
      zone: c.ward,
      category: c.category,
      count: c.count,
    }));

    if (!hasGeminiKey || !ai) {
      // Offline fallback
      const fallbackAlerts: PredictiveAlert[] = [
        {
          zone: 'Ward 12 - Indiranagar',
          category: 'Roads',
          riskLevel: 'High',
          likelihood: '88%',
          recommendation: 'Perform comprehensive asphalt overlay instead of recurring pothole patching on 100 Feet Rd due to high traffic strain.',
          timeframe: 'within 2 weeks'
        },
        {
          zone: 'Ward 12 - Indiranagar',
          category: 'Electricity',
          riskLevel: 'Medium',
          likelihood: '65%',
          recommendation: 'Audit low-hanging heavy electrical lines around Metro structures prior to heavy monsoon windfalls.',
          timeframe: 'within 4 weeks'
        }
      ];
      return res.json({
        predictions: fallbackAlerts,
        summary: 'Hotspot density analysis indicates active clusters of Roads and Electricity failures in Ward 12. Monsoon weather conditions could escalate these to high safety hazards.'
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analyze these civic issue clusters and active reports data to predict infrastructure breakdowns and suggest risk remediation.

Input Clusters:
${JSON.stringify(activeClusters, null, 2)}

Return ONLY a valid JSON object with exactly these fields:
{
  "predictions": [
    {
      "zone": "area name / ward",
      "category": "Roads | Water | Electricity | Waste | Public Safety",
      "riskLevel": "High | Medium | Low",
      "likelihood": "string e.g. 85%",
      "recommendation": "highly actionable technical recommendation for city officials",
      "timeframe": "string e.g. within 2 weeks"
    }
  ],
  "summary": "2-sentence high-level executive briefing summarizing the municipal risks"
}

No markdown. No extra talk. Pure JSON.`
        ,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const cleaned = text.trim().replace(/^```json/, '').replace(/```$/, '').trim();
      res.json(JSON.parse(cleaned));
    } catch (err: any) {
      console.error('Gemini prediction error:', err);
      res.status(500).json({ error: 'Prediction generation failed', details: err.message });
    }
  });

  // Civix Copilot Advisor Agent
  app.post('/api/gemini/copilot', async (req, res) => {
    const { message, history } = req.body;
    const dbData = getDB();

    // Compile active analytics summary to ground the AI
    const issues = dbData.issues;
    const openIssues = issues.filter((i: Issue) => i.status !== 'Resolved');
    const resolvedIssues = issues.filter((i: Issue) => i.status === 'Resolved');

    const byCategory = issues.reduce((acc: any, i: Issue) => {
      acc[i.category] = (acc[i.category] || 0) + 1;
      return acc;
    }, {});

    const byDept = dbData.departments.map((d: Department) => ({
      name: d.name,
      assigned: d.totalAssigned,
      resolved: d.totalResolved,
    }));

    const dataContext = {
      totalIssues: issues.length,
      openIssuesCount: openIssues.length,
      resolvedIssuesCount: resolvedIssues.length,
      issuesByCategory: byCategory,
      departmentsPerformance: byDept,
      activeIssuesList: openIssues.map((i: Issue) => ({
        id: i.id,
        title: i.title,
        category: i.category,
        severity: i.severity,
        status: i.status,
        daysOpen: Math.round((Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        department: i.department,
      })),
    };

    if (!hasGeminiKey || !ai) {
      return res.json({ 
        text: "I am running in Offline Mode because the Gemini API Key is not set up yet. Here is a high-level data summary:\n\n" +
             `* **Total Issues:** ${dataContext.totalIssues} (${dataContext.openIssuesCount} active, ${dataContext.resolvedIssuesCount} resolved).\n` +
             `* **Hot Categories:** ${Object.entries(byCategory).map(([k, v]) => `${k} (${v})`).join(', ')}.\n\n` +
             "Please add your `GEMINI_API_KEY` in the **Settings > Secrets** panel to unlock my complete analytical capabilities, detailed predictions, and custom report building!"
      });
    }

    try {
      const formattedHistory = (history || []).map((h: any) => ({
        role: h.role,
        parts: [{ text: h.content }],
      }));

      // Combine system prompt, context and user question
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...formattedHistory,
          {
            text: `You are Civix Copilot, an advanced municipal analytics AI assistant for government officials, city planners, and authorities.

Current City Issues Database Context:
${JSON.stringify(dataContext, null, 2)}

User request: "${message}"

Formulate a concise, highly professional, data-driven, and actionable response. Use markdown tables, bold highlights, and bullet points to organize insights. Always recommend proactive fixes based on the data. Keep responses clear and free of generic fluff.`
          }
        ],
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini Copilot error:', err);
      res.status(500).json({ error: 'Copilot failed to respond', details: err.message });
    }
  });

  // Admin User management
  app.post('/api/admin/users/role', (req, res) => {
    const { uid, role } = req.body;
    const dbData = getDB();

    const user = dbData.users.find((u: User) => u.uid === uid);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    saveDB(dbData);
    res.json(user);
  });

  // Admin Departments management
  app.post('/api/admin/departments', (req, res) => {
    const { name, category, head, contact } = req.body;
    const dbData = getDB();

    const id = 'dept-' + Math.random().toString(36).substring(2, 7);
    const newDept: Department = {
      id,
      name,
      category,
      head,
      contact,
      totalAssigned: 0,
      totalResolved: 0
    };

    dbData.departments.push(newDept);
    saveDB(dbData);
    res.json(newDept);
  });

  // Seed / Reset Database endpoint
  app.post('/api/admin/reset', (req, res) => {
    saveDB(initialState);
    res.json({ success: true, state: initialState });
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE SETUP
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Civix AI] Full-Stack server booted successfully on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal: Failed to start the Civix AI full-stack server:', err);
});
