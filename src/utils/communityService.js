import api from '../api/axios';

export const CASTE_SUB_COMMUNITIES_MAP = {
  // Hindu
  'Brahmin': ['Saraswat', 'Kanyakubja', 'Gaur', 'Saryuparin', 'Iyer', 'Iyengar', 'Bhumihar', 'Chitpavan', 'Namboodiri', 'Nagar', 'Smartha', 'Sri Vaishnava', 'Other'],
  'Rajput': ['Shekhawat', 'Rathore', 'Chauhan', 'Sisodia', 'Jadeja', 'Parmar', 'Tomar', 'Bundela', 'Solanki', 'Other'],
  'Jat': ['Gill', 'Mann', 'Sidhu', 'Dhillon', 'Sandhu', 'Grewal', 'Hooda', 'Dagar', 'Malik', 'Other'],
  'Yadav': ['Ahir', 'Gwal', 'Nandavanshi', 'Suryavanshi', 'Krishnauth', 'Majraut', 'Other'],
  'Maratha': ['96 Kuli Maratha', 'Kunbi Maratha', 'Koknastha', 'Deshmukh', 'Patil', 'Other'],
  'Nair': ['Kiryath Nair', 'Illathu Nair', 'Swaroopathu Nair', 'Menon', 'Pillai', 'Panicker', 'Other'],
  'Kshatriya': ['Raju', 'Verma', 'Khatri', 'Bhatia', 'Other'],
  'Vaishya': ['Arya Vysya', 'Komati', 'Gupta', 'Maheshwari', 'Mahajan', 'Other'],
  'Kayastha': ['Srivastava', 'Saxena', 'Mathur', 'Bhatnagar', 'Nigam', 'Asthana', 'Bengali Kayastha', 'Other'],
  'Agarwal': ['Goel', 'Garg', 'Bansal', 'Singhal', 'Mittal', 'Jindal', 'Other'],
  'Lingayat': ['Veerashaiva', 'Jangam', 'Panchachara', 'Sadar', 'Banajiga', 'Other'],
  'Reddy': ['Motati', 'Gudati', 'Pokanati', 'Pedakanti', 'Reddiar', 'Other'],
  'Patel': ['Kadva Patel', 'Leuva Patel', 'Anjana Patel', 'Other'],
  'Kurmi': ['Verma', 'Patel', 'Sachan', 'Gangwar', 'Jaiswar', 'Other'],
  'Gupta': ['Sahu', 'Shaw', 'Teli', 'Halwai', 'Other'],
  'Sonar': ['Daivajna', 'Sunar', 'Other'],
  'Jatav': ['Chamar', 'Jatav', 'Other'],
  'Baniya': ['Agarwal', 'Oswal', 'Maheshwari', 'Porwal', 'Other'],
  'Kamma': ['Chowdary', 'Naidu', 'Other'],
  'Kapu': ['Balija', 'Munnuru Kapu', 'Telaga', 'Naidu', 'Other'],
  'Mudaliar': ['Arcot', 'Vellalar', 'Sengunthar', 'Other'],
  'Nadar': ['Shanar', 'Nadar', 'Other'],
  'Gounder': ['Kongu Vellalar', 'Gounder', 'Other'],
  'Vishwakarma': ['Jangid', 'Panchal', 'Sutar', 'Other'],
  // Muslim
  'Sunni': ['Hanafi', 'Shafi', 'Maliki', 'Hanbali', 'Deobandi', 'Barelvi', 'Other'],
  'Shia': ['Ithna Ashari', 'Ismaili', 'Bohra', 'Khoja', 'Other'],
  'Syed': ['Hashmi', 'Gilani', 'Alvi', 'Zaidi', 'Other'],
  'Sheikh': ['Siddiqui', 'Farooqi', 'Usmani', 'Other'],
  'Pathan': ['Khan', 'Yousufzai', 'Afridi', 'Khattak', 'Other'],
  'Mughal': ['Mirza', 'Beg', 'Chughtai', 'Other'],
  'Ansari': ['Weaver', 'Momin Ansari', 'Other'],
  'Qureshi': ['Butcher', 'Qureshi Sheikh', 'Other'],
  'Bohra': ['Dawoodi Bohra', 'Alavi Bohra', 'Suleimani Bohra', 'Other'],
  'Khoja': ['Nizari', 'Ismaili', 'Shia Khoja', 'Other'],
  // Christian
  'Roman Catholic': ['Latin Catholic', 'Syrian Catholic', 'Mangalorean Catholic', 'Goan Catholic', 'Other'],
  'Protestant': ['CSI', 'CNI', 'Methodist', 'Baptist', 'Other'],
  'Orthodox': ['Malankara Orthodox', 'Syrian Orthodox', 'Knanaya Orthodox', 'Other'],
  'Syrian Catholic': ['Syrian Catholic', 'Syro-Malabar', 'Syro-Malankara', 'Other'],
  'Pentecostal': ['Assembly of God', 'IPC', 'New Life', 'Other'],
  // Sikh
  'Jat Sikh': ['Gill', 'Mann', 'Sidhu', 'Dhillon', 'Sandhu', 'Grewal', 'Other'],
  'Khatri': ['Sodhi', 'Bedi', 'Kapoor', 'Khanna', 'Malhotra', 'Sethi', 'Other'],
  'Arora': ['Chawla', 'Juneja', 'Ahuja', 'Taneja', 'Batra', 'Other'],
  'Ramgarhia': ['Vishwakarma', 'Tarkhan', 'Other'],
  'Mazhabi': ['Valmiki', 'Mazhabi', 'Other'],
  'Saini': ['Shoorsaini', 'Saini', 'Other'],
  'Rajput Sikh': ['Rathore', 'Chauhan', 'Parmar', 'Other'],
  // Jain
  'Jain - Digambar': ['Oswal', 'Porwal', 'Khandelwal', 'Humad', 'Jaiswal', 'Other'],
  'Jain - Shvetambar': ['Oswal', 'Porwal', 'Other']
};

export const DEFAULT_RELIGION_SUB_COMMUNITIES = {
  "Hindu": [
    "96 Kuli Maratha", "Adi Dharmi", "Adi Karnataka", "Ahom", "Baniya", "Bari",
    "Brahmin - Anavil", "Brahmin - Gour", "Brahmin - Other", "Chhetri", "Gowda",
    "Kashyap", "Kayastha", "Khatri", "Kshatriya", "Kushwaha", "Rajput", "Saha",
    "Scheduled Tribe (ST)", "Yadav", "24 Manai Telugu Chettiar", "96K Kokanastha",
    "Adi Andhra", "Adi Dravida", "Agamudayar", "Agarwal", "Agnikula Kshatriya",
    "Agri", "Ahir", "Ambalavasi", "Arcot", "Arekatica", "Arora", "Arunthathiyar",
    "Arya Vysya", "Aryasamaj", "Ayyaraka", "Badaga", "Baghel/Pal/Gaderiya", "Bahi",
    "Baidya", "Baishnab", "Baishya", "Bajantri", "Balija", "Balija - Naidu",
    "Banayat Oriya", "Banik", "Barai", "Barnwal", "Barujibi", "Besta", "Bhandari",
    "Bhatia", "Bhatraju", "Bhavsar", "Bhovi", "Billava", "Boya/Nayak/Naik", "Boyer",
    "Brahmbatt", "Brahmin - Audichya", "Brahmin - Barendra", "Brahmin - Bhatt",
    "Brahmin - Bhumihar", "Brahmin - Brahmbhatt", "Brahmin - Dadhich/Dadheech",
    "Brahmin - Daivadnya", "Brahmin - Danua", "Brahmin - Deshastha", "Brahmin - Dhiman",
    "Brahmin - Dravida", "Brahmin - Embrandiri", "Brahmin - Goswami", "Brahmin - Gowd Saraswat",
    "Brahmin - Gujar Gour", "Brahmin - Gurukkal", "Brahmin - Halua", "Brahmin - Havyaka",
    "Brahmin - Himachali", "Brahmin - Hoysala", "Brahmin - Iyengar", "Brahmin - Iyer",
    "Brahmin - Jangid", "Brahmin - Jhadua", "Brahmin - Jhijhotiya", "Brahmin - Kanyakubja",
    "Brahmin - Karhade", "Brahmin - Kashmiri Pandit", "Brahmin - Kokanastha", "Brahmin - Kota",
    "Brahmin - Kulin", "Brahmin - Kumaoni", "Brahmin - Madhwa", "Brahmin - Maithili",
    "Brahmin - Modh", "Brahmin - Mohyal", "Brahmin - Nagar", "Brahmin - Namboodiri",
    "Brahmin - Niyogi", "Brahmin - Niyogi Nandavariki", "Brahmin - Paliwal", "Brahmin - Panda",
    "Brahmin - Pareek", "Brahmin - Pushkarna", "Brahmin - Rarhi", "Brahmin - Rudraj",
    "Brahmin - Sakaldwipi", "Brahmin - Sanadya", "Brahmin - Sanketi", "Brahmin - Saraswat",
    "Brahmin - Sarua", "Brahmin - Saryuparin", "Brahmin - Shivhalli", "Brahmin - Shrimali",
    "Brahmin - Smartha", "Brahmin - Sri Vaishnava", "Brahmin - Stanika", "Brahmin - Tyagi",
    "Brahmin - Vaidiki", "Brahmin - Vaikhanasa", "Brahmin - Velanadu", "Brahmin - Viswabrahmin",
    "Brahmin - Vyas", "Brahmo", "Buddar", "Bunt (Shetty)", "CKP", "Chalawadi Holeya",
    "Chambhar", "Chandravanshi Kahar", "Chasa", "Chattada Sri Vaishnava", "Chaudary",
    "Chaurasia", "Chekkala - Nair", "Chennadasar", "Cheramar", "Chettiar", "Chippolu/Mera",
    "Devadiga", "Devanga", "Devar/Thevar/Mukkulathor", "Devendra Kula Vellalar", "Dhangar",
    "Dheevara", "Dhiman", "Dhoba", "Digambar", "Dommala", "Dusadh", "Ediga", "Ezhava",
    "Ezhuthachan", "Gabit", "Ganakar", "Gandla", "Ganiga", "Gatti", "Gavali", "Gavara",
    "Ghumar", "Goala", "Goswami", "Goud", "Gounder", "Gramani", "Gudia", "Gujjar", "Gupta",
    "Guptan", "Gurjar", "Halwai", "Hegde", "Helava", "Hugar (Jeer)", "Intercaste", "Jaalari",
    "Jaiswal", "Jandra", "Jangam", "Jat", "Jatav", "Jetty Malla", "Kachara", "Kaibarta",
    "Kakkalan", "Kalar", "Kalinga", "Kalinga Vysya", "Kalita", "Kalwar", "Kamboj", "Kamma",
    "Kamma Naidu", "Kammala", "Kaniyan", "Kansari", "Kanu", "Kapu", "Kapu Naidu", "Karana",
    "Karmakar", "Kartha", "Karuneegar", "Kasar", "Kavuthiyya/Ezhavathy", "Khandayat",
    "Khandelwal", "Kharwar", "Khatik", "Kirar", "Koli", "Koli Patel", "Kongu Vellala Gounder",
    "Korama", "Kori", "Koshti", "Krishnavaka", "Kshatriya - Bhavasar", "Kshatriya/Raju/Varma",
    "Kudumbi", "Kulal", "Kulalar", "Kulita", "Kumawat", "Kumbara", "Kumbhakar/Kumbhar",
    "Kumhar", "Kummari", "Kunbi", "Kurava", "Kuravan", "Kurmi", "Kurmi Kshatriya", "Kuruba",
    "Kuruhina Shetty", "Kurumbar", "Kurup", "Lambadi/Banjara", "Lambani", "Leva Patil",
    "Lingayath", "Lohana", "Lohar", "Loniya/Lonia/Lunia", "Lubana", "Madhesiya", "Madiga",
    "Mahajan", "Mahar", "Mahendra", "Maheshwari", "Mahindra", "Mahishya", "Majabi", "Mala",
    "Malayalee Variar", "Mali", "Mallah", "Mangalorean", "Maniyani", "Mannadiar", "Mannan",
    "Mapila", "Marar", "Maratha", "Maratha - Gomantak", "Maruthuvar", "Marvar", "Marwari",
    "Matang", "Maurya", "Meda", "Medara", "Meena", "Meenavar", "Meghwal", "Mehra", "Menon",
    "Meru Darji", "Modak", "Mogaveera", "Monchi", "Mudaliar", "Mudaliar - Arcot", "Mudaliar - Saiva",
    "Mudaliar - Senguntha", "Mudiraj", "Munnuru Kapu", "Muthuraja", "Naagavamsam", "Nadar",
    "Nagaralu", "Nai", "Naicken", "Naicker", "Naidu", "Naik", "Nair", "Nair - Vaniya",
    "Nair - Velethadathu", "Nair - Vilakkithala", "Namasudra", "Nambiar", "Nambisan", "Namdev",
    "Namosudra", "Napit", "Nayak", "Nayaka", "Neeli", "Nhavi", "OBC - Barber/Naayee", "Oswal",
    "Otari", "Padmasali", "Panchal", "Pandaram", "Panicker", "Paravan", "Parit", "Parkava Kulam",
    "Partraj", "Pasi", "Paswan", "Patel", "Patel - Desai", "Patel - Dodia", "Patel - Kadva",
    "Patel - Leva", "Patnaick", "Patra", "Patwa", "Perika", "Pillai", "Pisharody", "Poduval",
    "Poosala", "Porwal", "Prajapati", "Pulaya", "Raigar", "Rajaka/Chakali/Dhobi", "Rajbhar",
    "Rajput - Kumaoni", "Rajput - Lodhi", "Ramdasia", "Ramgharia", "Rauniyar", "Ravidasia",
    "Rawat", "Reddiar", "Reddy", "Relli", "SSK", "Sadgop", "Sagara - Uppara", "Sahu", "Saini",
    "Saiva Vellala", "Saliya", "Sambava", "Satnami", "Savji", "Scheduled Caste (SC)",
    "Senai Thalaivar", "Sepahia", "Setti Balija", "Shah", "Shilpkar", "Shimpi", "Sindhi - Bhanusali",
    "Sindhi - Bhatia", "Sindhi - Chhapru", "Sindhi - Dadu", "Sindhi - Hyderabadi", "Sindhi - Larai",
    "Sindhi - Lohana", "Sindhi - Rohiri", "Sindhi - Sehwani", "Sindhi - Thatai", "Sindhi-Amil",
    "Sindhi-Baibhand", "Sindhi-Larkana", "Sindhi-Sahiti", "Sindhi-Sakkhar", "Sindhi-Shikarpuri",
    "Somvanshi", "Sonar", "Soni", "Sozhiya Vellalar", "Sri Vaishnava", "Srisayana", "Subarna Banik",
    "Sugali (Naika)", "Sundhi", "Surya Balija", "Sutar", "Suthar", "Swakula Sali", "Swarnakar",
    "Tamboli", "Tanti", "Tantuway", "Telaga", "Teli", "Thachar", "Thakkar", "Thakur", "Thandan",
    "Thigala", "Thiyya", "Thuluva Vellala", "Tili", "Togata", "Turupu Kapu", "Udayar",
    "Urali Gounder", "Urs", "Vada Balija", "Vadagalai", "Vaddera", "Vaduka", "Vaish",
    "Vaish - Dhaneshawat", "Vaishnav", "Vaishnav - Bhatia", "Vaishnav - Vania", "Vaishya",
    "Vallala", "Valluvan", "Valmiki", "Vanika Vyshya", "Vaniya Chettiar", "Vanjara", "Vankar",
    "Vannan", "Vannar", "Vanniyakullak Kshatriya", "Vanniyar", "Variar", "Varshney", "Veerashaiva",
    "Velaan", "Velama", "Velar", "Vellalar", "Veluthedathu - Nair", "Vettuva Gounder",
    "Vishwakarma", "Viswabrahmin", "Vokkaliga", "Vysya", "Waada Balija", "Yellapu", "Other"
  ],
  "Muslim": [
    "Ansari", "Arain", "Awan", "Dekkani", "Jat", "Lebbai", "Memon", "Mughal", "Pathan",
    "Qureshi", "Rajput", "Shafi", "Sheikh", "Shia", "Shia Ithna ashariyyah", "Siddiqui",
    "Sunni", "Sunni Ehle-Hadith", "Sunni Hanafi", "Sunni Shafi", "Syed", "Dawoodi Bohra",
    "Dudekula", "Khoja", "Mapila", "Maraicar", "Rowther", "Shia Bohra", "Shia Imami Ismaili",
    "Shia Zaidi", "Sunni Hunbali", "Sunni Maliki", "Other"
  ],
  "Christian": [
    "Anglo Indian", "Born Again", "Bretheren", "CMS", "Catholic", "Church of North India (CNI)",
    "Church of South India (CSI)", "Convert", "Evangelical", "IPC", "Indian Orthodox",
    "Intercaste", "Methodist", "Orthodox", "Pentecost", "Presbyterian", "Protestant",
    "Roman Catholic", "Salvation Army", "Scheduled Caste (SC)", "Seventh day Adventist",
    "Basel Mission", "Cannonite", "Catholic Knanya", "Catholic Malankara", "Chaldean Syrian",
    "Cheramar", "Jacobite", "Jacobite Knanya", "Knanaya", "Knanaya Catholic", "Knanaya Jacobite",
    "Knanaya Pentecostal", "Knanya", "Latin Catholic", "Malankara", "Malankara Catholic",
    "Manglorean", "Marthoma", "Mormon", "Nadar", "RCSC", "Scheduled Tribe (ST)", "Syrian",
    "Syrian Catholic", "Syrian Orthodox", "Syro Malabar", "Other"
  ],
  "Buddhist": ["Other"],
  "Jain": [
    "Digambar", "Porwal", "Shwetamber", "Vania", "Other"
  ],
  "Sikh": [
    "Ahluwalia", "Arora", "Clean Shaven", "Gursikh", "Jat", "Kamboj", "Kesadhari",
    "Khatri", "Kshatriya", "Labana", "Mazhbi/Majabi", "Rajput", "Ramdasia", "Ramgharia",
    "Ravidasia", "Saini", "Other"
  ],
  "Jewish": ["Other"],
  "Parsi": ["Other"],
  "No Religion": ["Other"],
  "Spiritual - not religious": ["Other"]
};

let cachedData = null;
let activeFetchPromise = null;

/**
 * Fetch communities and subcommunities from /public/communities
 * Cached in memory so it only runs once per app session
 */
export async function fetchCommunitiesData() {
  if (cachedData) return cachedData;
  if (activeFetchPromise) return activeFetchPromise;

  activeFetchPromise = api.get('/public/communities')
    .then(res => {
      cachedData = {
        communities: Array.isArray(res.data?.communities) ? res.data.communities : [],
        subcommunities: (res.data?.subcommunities && typeof res.data.subcommunities === 'object')
          ? res.data.subcommunities
          : DEFAULT_RELIGION_SUB_COMMUNITIES
      };
      return cachedData;
    })
    .catch(err => {
      console.warn('Could not fetch server communities, using fallback:', err);
      cachedData = {
        communities: [],
        subcommunities: DEFAULT_RELIGION_SUB_COMMUNITIES
      };
      return cachedData;
    })
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

/**
 * Get unified subcommunity options based on religion, caste, and server-fetched data.
 * Always ensures the user's currently saved value is preserved in the list.
 */
export function getSubCommunityOptions(religion, caste, subcommunitiesMap, currentVal = '') {
  const map = subcommunitiesMap || cachedData?.subcommunities || DEFAULT_RELIGION_SUB_COMMUNITIES;
  const religionList = (religion && map && map[religion]) ? map[religion] : (DEFAULT_RELIGION_SUB_COMMUNITIES[religion] || []);
  const casteSpecific = (caste && CASTE_SUB_COMMUNITIES_MAP[caste])
    ? CASTE_SUB_COMMUNITIES_MAP[caste].filter(x => x !== 'Other')
    : [];

  let options = [];

  // 1. Caste-specific options
  if (casteSpecific.length > 0) {
    options.push(...casteSpecific);
  }

  // 2. Server subcommunities matching this caste name (e.g. "Brahmin - Anavil" for Brahmin)
  if (caste && religionList.length > 0) {
    const casteLower = caste.toLowerCase();
    const matching = religionList.filter(s => {
      const sLower = s.toLowerCase();
      return sLower.includes(casteLower) || casteLower.includes(sLower);
    });
    options.push(...matching);
  }

  // 3. All other religion subcommunities
  if (religionList.length > 0) {
    options.push(...religionList);
  }

  // Deduplicate and filter out 'Other' for now so it's placed at the end
  const set = new Set();
  const result = [];
  for (const opt of options) {
    if (opt && opt !== 'Other' && !set.has(opt)) {
      set.add(opt);
      result.push(opt);
    }
  }

  // Preserve existing current value if it's not already in list
  if (currentVal && currentVal !== 'Other' && !set.has(currentVal)) {
    result.unshift(currentVal);
    set.add(currentVal);
  }

  // Append 'Other' at the end
  result.push('Other');

  return result;
}
