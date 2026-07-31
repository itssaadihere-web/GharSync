"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappWebhook = exports.onItemBought = exports.onItemCreated = exports.parseListItem = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const generative_ai_1 = require("@google/generative-ai");
admin.initializeApp();
const messaging = admin.messaging();
/**
 * AI Item Categorization & Quantity Parsing Callable Function
 * Uses Google Gemini API when GEMINI_API_KEY is available, or rule-based fallback logic.
 */
exports.parseListItem = functions.https.onCall(async (data, context) => {
    const rawText = data?.text?.trim() || '';
    if (!rawText) {
        throw new functions.https.HttpsError('invalid-argument', 'Text input must not be empty.');
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
        try {
            const ai = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `You are a household grocery assistant for a Pakistani/South Asian family app.
Parse the raw spoken or typed input text into a clean item name, quantity, unit, and category.

Input: "${rawText}"

CRITICAL RULES:
1. EXTRACT QUANTITY: Parse Roman Urdu and English numbers at the start of text (e.g. "ek/aik" = 1, "do" = 2, "teen" = 3, "chaar" = 4, "paanch" = 5, "aadha" = 0.5, "pao" = 0.25).
2. STRIP CONVERSATIONAL VERBS & FILLER WORDS: Completely remove conversational intent and action verbs (e.g. "lekar aao", "lekar aane", "le aao", "laana hai", "mangwa do", "chahiye", "bhi", "please bring").
3. CLEAN ITEM NAME ONLY: The itemName must contain ONLY the clean noun phrase (e.g. "do Mario ke toys lekar aao" -> quantity: 2, itemName: "Mario Toys"). Do NOT include full sentences or action verbs!

Return JSON matching this schema:
{
  "itemName": "clean short noun item name (e.g. Mario Toys, Aloo, Doodh, Dettol Soap)",
  "quantity": numeric quantity (default 1.0 if not specified),
  "unit": "kg" | "gram" | "liter" | "packet" | "dozen" | "pcs" | "bottle" | "box" | "custom string",
  "category": "Vegetables" | "Dairy" | "Toiletries" | "Medical" | "Grocery" | "Other"
}

Categorization guide:
- Vegetables: aloo, pyaz, tamatar, khera, palak, coriander, ginger, garlic, sabzi, etc.
- Dairy: doodh, milk, dahi, yogurt, butter, cheese, cream, eggs, anda.
- Toiletries: soap, dettol, shampoo, paste, surf, detergent, tissue, harpic, handwash.
- Medical: panadol, disprin, bandages, medicine, syrup, tablets, ointment, b-complex.
- Grocery: atta, rice, chawal, ghee, oil, daal, sugar, chini, salt, spices, tea, patti.
- Other: toys, games, electronics, stationery, clothes, etc.

Return ONLY raw JSON, no markdown wrapper.`;
            const response = await model.generateContent(prompt);
            const responseText = response.response.text() ? response.response.text().trim() : '';
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    itemName: parsed.itemName || rawText,
                    quantity: Number(parsed.quantity) || 1,
                    unit: parsed.unit || 'pcs',
                    category: parsed.category || categorizeFallback(rawText),
                };
            }
        }
        catch (error) {
            console.warn('Gemini LLM parsing error, using fallback parser:', error);
        }
    }
    else {
        console.log('GEMINI_API_KEY environment variable not set. Using Rule-Based Fallback Parser.');
    }
    // Rule-based fallback parser if API Key is missing or request failed
    return parseRuleBased(rawText);
});
/**
 * Fallback parser in Node.js TypeScript
 */
function parseRuleBased(text) {
    let lower = text.toLowerCase().trim();
    // Step 1: Strip leading conversational intent words e.g. "mujhe", "i want", "please get", "مجھے"
    lower = lower.replace(/^\b(please|plz|mujhe|hameen|humko|kindly|can you|bring me|get me|buy me|need|i want|want|mujhe\s+bhi|mujhy)\b\s*/gi, '');
    lower = lower.replace(/^(مجھے|ہمیں|ہمارے لیے|برائے مہربانی|چاہیے)\s*/gi, '');
    // Step 2: Strip trailing conversational verb fillers e.g. "chahiye", "lekar aao", "laana hai", "چاہیے"
    const trailingFillers = [
        /\b(chahiye|chahie|chaheay|chahey|chahye|zaroorat\s+hai|zaroori\s+hai|zaroor\s+laana)\b/gi,
        /\b(lekar\s+aao|lekar\s+aana|lekar\s+aane|lekar\s+aen|le\s+kar\s+aao|le\s+kar\s+aana)\b/gi,
        /\b(le\s+aao|le\s+aana|le\s+aen|le\s+ke\s+aao|le\s+ke\s+aana|le\s+ao)\b/gi,
        /\b(laana\s+hai|lana\s+hai|lani\s+hai|laane\s+hain|laao|lana|lani)\b/gi,
        /\b(mangwa\s+do|mangwa\s+dein|bhej\s+do|bhej\s+dein|xareed\s+lo|khareed\s+laao)\b/gi,
        /\b(bhi|bhee|please|plz|phir|se|de\s+do|doh)\b/gi,
        /(چاہیے|چاہئیے|ضرورت ہے|ضروری ہے|لانا ہے|لاؤ|لے آؤ|منگوا دو|بھیج دو|خرید لو|بھی)/g
    ];
    trailingFillers.forEach(pat => { lower = lower.replace(pat, ' '); });
    lower = lower.replace(/\s+/g, ' ').trim();
    let quantity = 1;
    let unit = 'pcs';
    let cleanName = lower;
    // Step 3: Extract Urdu Script and Roman Urdu numbers e.g. "paanch" -> 5, "do" -> 2, "پانچ" -> 5
    if (/^(ایک|1)\s*/.test(lower)) {
        quantity = 1;
        lower = lower.replace(/^(ایک|1)\s*/, '');
    }
    else if (/^(دو|2)\s*/.test(lower)) {
        quantity = 2;
        lower = lower.replace(/^(دو|2)\s*/, '');
    }
    else if (/^(تین|3)\s*/.test(lower)) {
        quantity = 3;
        lower = lower.replace(/^(تین|3)\s*/, '');
    }
    else if (/^(چار|4)\s*/.test(lower)) {
        quantity = 4;
        lower = lower.replace(/^(چار|4)\s*/, '');
    }
    else if (/^(پانچ|5)\s*/.test(lower)) {
        quantity = 5;
        lower = lower.replace(/^(پانچ|5)\s*/, '');
    }
    else if (/^\b(aadha|adha|half)\b/i.test(lower)) {
        quantity = 0.5;
        lower = lower.replace(/^\b(aadha|adha|half)\b\s*/i, '');
    }
    else if (/^\b(pao|paao)\b/i.test(lower)) {
        quantity = 0.25;
        unit = 'kg';
        lower = lower.replace(/^\b(pao|paao)\b\s*/i, '');
    }
    else if (/^\b(ek|aik|one|1)\b/i.test(lower)) {
        quantity = 1;
        lower = lower.replace(/^\b(ek|aik|one|1)\b\s*/i, '');
    }
    else if (/^\b(do|two|2)\b/i.test(lower)) {
        quantity = 2;
        lower = lower.replace(/^\b(do|two|2)\b\s*/i, '');
    }
    else if (/^\b(teen|tin|three|3)\b/i.test(lower)) {
        quantity = 3;
        lower = lower.replace(/^\b(teen|tin|three|3)\b\s*/i, '');
    }
    else if (/^\b(chaar|char|four|4)\b/i.test(lower)) {
        quantity = 4;
        lower = lower.replace(/^\b(chaar|char|four|4)\b\s*/i, '');
    }
    else if (/^\b(paanch|panch|five|5)\b/i.test(lower)) {
        quantity = 5;
        lower = lower.replace(/^\b(paanch|panch|five|5)\b\s*/i, '');
    }
    cleanName = lower;
    // Step 4: Extract quantity & unit using regex for digits
    const qtyUnitRegex = /^([\d.\/]+)\s*([a-zA-Z]*)\s+(.*)$/;
    const match = lower.match(qtyUnitRegex);
    if (match) {
        const rawQty = match[1];
        const rawUnit = match[2];
        const rawName = match[3];
        if (rawQty.includes('/')) {
            const parts = rawQty.split('/');
            quantity = parseFloat(parts[0]) / parseFloat(parts[1]);
        }
        else {
            quantity = parseFloat(rawQty) || 1;
        }
        if (rawUnit) {
            unit = normalizeUnit(rawUnit);
        }
        cleanName = rawName;
    }
    // Step 5: Strip trailing fillers again if digit matching left any behind
    trailingFillers.forEach(pat => { cleanName = cleanName.replace(pat, ' '); });
    cleanName = cleanName.replace(/\b(ke|k|wala|wali|walay)\b/gi, ' ').replace(/\s+/g, ' ').trim();
    if (lower.includes('kilo') || lower.includes('kg'))
        unit = 'kg';
    if (lower.includes('liter') || lower.includes('litre') || lower.includes('ltr'))
        unit = 'liter';
    if (lower.includes('dozen') || lower.includes('dazan') || lower.includes('dazzen'))
        unit = 'dozen';
    const category = categorizeFallback(cleanName);
    // Capitalize clean item name
    cleanName = cleanName.split(' ').map(w => w ? w[0].toUpperCase() + w.substring(1).toLowerCase() : '').join(' ');
    if (!cleanName)
        cleanName = text;
    return {
        itemName: cleanName,
        quantity,
        unit,
        category,
    };
}
function normalizeUnit(u) {
    const lower = u.toLowerCase();
    if (['kg', 'kilo', 'kilogram', 'kilos'].includes(lower))
        return 'kg';
    if (['g', 'gram', 'grams'].includes(lower))
        return 'gram';
    if (['l', 'liter', 'litre', 'liters'].includes(lower))
        return 'liter';
    if (['pkt', 'packet', 'packets'].includes(lower))
        return 'packet';
    if (['doz', 'dozen', 'dazan'].includes(lower))
        return 'dozen';
    return u;
}
function categorizeFallback(name) {
    const lower = name.toLowerCase();
    if (/(aloo|pyaz|tamatar|khera|palak|coriander|ginger|garlic|sabzi|onion|potato|tomato|vegetable)/.test(lower)) {
        return 'Vegetables';
    }
    if (/(doodh|milk|dahi|yogurt|butter|cheese|cream|egg|anda)/.test(lower)) {
        return 'Dairy';
    }
    if (/(soap|dettol|shampoo|paste|surf|detergent|tissue|harpic|handwash|cleaner)/.test(lower)) {
        return 'Toiletries';
    }
    if (/(panadol|disprin|bandage|medicine|syrup|tablet|ointment|pharmacy|doctor)/.test(lower)) {
        return 'Medical';
    }
    if (/(atta|rice|chawal|ghee|oil|daal|sugar|chini|salt|spice|tea|patti|bread|flour)/.test(lower)) {
        return 'Grocery';
    }
    return 'Other';
}
/**
 * FCM Push Notification: Triggered when a new item is added to the household list
 */
exports.onItemCreated = functions.firestore
    .document('households/{householdId}/listItems/{itemId}')
    .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    if (!data)
        return;
    const householdId = context.params.householdId;
    const addedByName = data.addedBy?.name || 'A family member';
    const itemName = data.itemName || 'an item';
    const qty = data.quantity ? `${data.quantity} ${data.unit || ''}` : '';
    const payload = {
        notification: {
            title: '🛒 New Item Added!',
            body: `${addedByName} added ${qty} ${itemName} to the household list.`,
        },
        data: {
            householdId,
            itemId: context.params.itemId,
            type: 'ITEM_ADDED',
        },
        topic: `household_${householdId}`,
    };
    try {
        await messaging.send(payload);
        console.log(`FCM notification sent for household ${householdId}`);
    }
    catch (err) {
        console.error('Error sending FCM notification:', err);
    }
});
/**
 * FCM Push Notification: Triggered when an item status changes to 'bought'
 */
exports.onItemBought = functions.firestore
    .document('households/{householdId}/listItems/{itemId}')
    .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    if (!beforeData || !afterData)
        return;
    // Trigger only when transitioning from pending to bought
    if (beforeData.status !== 'bought' && afterData.status === 'bought') {
        const householdId = context.params.householdId;
        const boughtByName = afterData.boughtBy?.name || 'A family member';
        const itemName = afterData.itemName || 'an item';
        const payload = {
            notification: {
                title: '✅ Item Bought!',
                body: `${boughtByName} just bought ${itemName}!`,
            },
            data: {
                householdId,
                itemId: context.params.itemId,
                type: 'ITEM_BOUGHT',
            },
            topic: `household_${householdId}`,
        };
        try {
            await messaging.send(payload);
            console.log(`FCM item bought notification sent for household ${householdId}`);
        }
        catch (err) {
            console.error('Error sending FCM bought notification:', err);
        }
    }
});
/**
 * WhatsApp Bot Webhook Function:
 * Receives incoming WhatsApp messages/voice notes from family members,
 * parses items using AI/Rule parser, and adds them to household Firestore list in real time.
 */
exports.whatsappWebhook = functions.https.onRequest(async (req, res) => {
    // Meta Webhook Verification (GET request)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'gharsync_secret_token';
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('WhatsApp Webhook Verified Successfully!');
            res.status(200).send(challenge);
            return;
        }
        else {
            res.status(403).send('Forbidden');
            return;
        }
    }
    // Incoming Message Handling (POST request)
    if (req.method === 'POST') {
        try {
            const body = req.body;
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];
            if (message) {
                const fromPhone = message.from; // Sender WhatsApp phone number
                const textBody = message.text?.body || message.caption || '';
                console.log(`WhatsApp message from ${fromPhone}: "${textBody}"`);
                // Look up household by sender's phone number
                const memberQuery = await admin.firestore()
                    .collectionGroup('members')
                    .where('phoneNumber', '==', `+${fromPhone}`)
                    .limit(1)
                    .get();
                if (!memberQuery.empty) {
                    const memberDoc = memberQuery.docs[0];
                    const householdRef = memberDoc.ref.parent.parent;
                    const memberData = memberDoc.data();
                    if (householdRef && textBody) {
                        // Parse item using rule-based/LLM logic
                        const parsed = parseRuleBased(textBody);
                        await householdRef.collection('listItems').add({
                            itemName: parsed.itemName,
                            quantity: parsed.quantity,
                            unit: parsed.unit,
                            category: parsed.category,
                            status: 'pending',
                            addedBy: {
                                userId: memberDoc.id,
                                name: `${memberData.name || 'WhatsApp'} (via WA)`,
                            },
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        console.log(`Added WA item "${parsed.itemName}" to household ${householdRef.id}`);
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        }
        catch (err) {
            console.error('WhatsApp Webhook error:', err);
            res.status(500).send('Internal Server Error');
        }
    }
});
//# sourceMappingURL=index.js.map