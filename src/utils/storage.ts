import { Restaurant, Review } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const STORAGE_KEY = 'allmoco_restaurants_ufcg_v8';
const FAVORITES_KEY = 'allmoco_favorites_ufcg_v1';
const FAVORITE_DISHES_KEY = 'allmoco_favorite_dishes_ufcg_v1';
const SPENDING_SETTINGS_KEY = 'allmoco_spending_settings_ufcg_v1';

export function getStoredFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error reading favorites:', e);
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Error saving favorites:', e);
  }
}

export function getStoredFavoriteDishes(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITE_DISHES_KEY);
    if (!raw) return ['dish-101', 'dish-201', 'dish-401'];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : ['dish-101', 'dish-201', 'dish-401'];
  } catch (e) {
    console.error('Error reading favorite dishes:', e);
    return ['dish-101', 'dish-201', 'dish-401'];
  }
}

export function saveStoredFavoriteDishes(dishIds: string[]): void {
  try {
    localStorage.setItem(FAVORITE_DISHES_KEY, JSON.stringify(dishIds));
  } catch (e) {
    console.error('Error saving favorite dishes:', e);
  }
}

export interface StoredSpendingFrequency {
  [dishId: string]: number; // days per week: 1..7
}

export function getStoredSpendingFrequency(): StoredSpendingFrequency {
  try {
    const raw = localStorage.getItem(SPENDING_SETTINGS_KEY);
    if (!raw) return { 'dish-101': 3, 'dish-201': 1, 'dish-401': 1 };
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : { 'dish-101': 3, 'dish-201': 1, 'dish-401': 1 };
  } catch (e) {
    return { 'dish-101': 3, 'dish-201': 1, 'dish-401': 1 };
  }
}

export function saveStoredSpendingFrequency(config: StoredSpendingFrequency): void {
  try {
    localStorage.setItem(SPENDING_SETTINGS_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving spending settings:', e);
  }
}

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Restaurante Universitário UFCG (RU Bodocongó)',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=RU+UFCG+Campus+Bodocongo+Campina+Grande',
    openingHours: '11:00 - 14:00',
    hasStudentDiscount: true,
    studentDiscountDetails: 'Refeição subsidiada a R$ 3,50 com carteirinha estudantil UFCG ativa',
    campusZone: 'Praça Central - UFCG Bodocongó',
    coordinates: { x: 50, y: 48 },
    pratoDoDia: 'Strogonoff de Cogumelos com Batata Palha Crocante',
    createdAt: Date.now() - 300000,
    ratings: { 'user-1': 5, 'user-2': 5, 'user-3': 4, 'user-4': 5, 'user-5': 5 },
    reviews: [
      {
        id: 'rev-101',
        userId: 'user-1',
        userName: 'Lucas Silva (Eng. Computação)',
        userPhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Excelente refeição por R$ 3,50! O strogonoff de cogumelos é impecável.',
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'rev-102',
        userId: 'user-2',
        userName: 'Mariana Costa (Design)',
        userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'Filas organizadas e comida super saborosa. Recomendo chegar às 11h40.',
        createdAt: Date.now() - 86400000 * 4,
      },
      {
        id: 'rev-103',
        userId: 'user-3',
        userName: 'Gabriel Alves (Física)',
        rating: 4,
        comment: 'Ótimo custo-benefício. A salada do atleta vem muito bem servida!',
        createdAt: Date.now() - 86400000 * 7,
      },
    ],
    dishes: [
      {
        id: 'dish-101',
        name: 'Prato do Dia - Strogonoff de Cogumelos',
        size: 'Prato Feito (500g)',
        availableDays: 'Segunda a Sexta',
        price: 3.5,
        description: 'Strogonoff cremoso de cogumelos paris, arroz branco, feijão carioca e batata palha crocante.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: false,
      },
      {
        id: 'dish-102',
        name: 'Bife Grelhado com Acebolado e Vinagrete',
        size: 'Prato Feito (550g)',
        availableDays: 'Segunda a Sexta',
        price: 3.5,
        description: 'Bife alcatra grelhado na hora, arroz, feijão preto temperado e salada verde com vinagrete.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-103',
        name: 'Salada Completa do Atleta',
        size: 'Marmita M (400g)',
        availableDays: 'Segunda a Sexta',
        price: 3.5,
        description: 'Mix de folhas, grão de bico temperado, tomate cereja, cenoura ralada e sementes de girassol.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'Cantina do CEEI / Bloco de Engenharias UFCG',
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=CEEI+UFCG+Bodocongo',
    openingHours: '07:30 - 21:30',
    hasStudentDiscount: true,
    studentDiscountDetails: '10% de desconto para estudantes da UFCG via PIX ou em dinheiro',
    campusZone: 'Bloco CEEI / Engenharias UFCG',
    coordinates: { x: 72, y: 30 },
    pratoDoDia: 'Feijoada Vegana Especial com Couve e Farofa Caseira',
    createdAt: Date.now() - 200000,
    ratings: { 'user-1': 5, 'user-2': 4, 'user-3': 5, 'user-4': 4 },
    reviews: [
      {
        id: 'rev-201',
        userId: 'user-1',
        userName: 'Fernanda Rocha (Medicina)',
        userPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
        rating: 5,
        comment: 'A feijoada vegana na quarta-feira é uma delícia! Ambiente super agradável perto do CEEI.',
        createdAt: Date.now() - 86400000 * 3,
      },
      {
        id: 'rev-202',
        userId: 'user-2',
        userName: 'Bruno Lima (Eng. Elétrica)',
        rating: 4,
        comment: 'A tapioca de frango salva os lanches entre as aulas do bloco CEEI. Desconto no PIX aprovado!',
        createdAt: Date.now() - 86400000 * 6,
      },
    ],
    dishes: [
      {
        id: 'dish-201',
        name: 'Marmita Executiva de Frango Grelhado',
        size: 'Marmita M (450g)',
        availableDays: 'Segunda a Sábado',
        price: 18.0,
        description: 'Filé de frango temperado com ervas, arroz integral ou branco, feijão e farofa caseira.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-202',
        name: 'Feijoada Vegana com Couve Refogada',
        size: 'Marmita G (600g)',
        availableDays: 'Quarta e Sexta',
        price: 22.0,
        description: 'Feijoada à base de cogumelos, abóbora, tofu defumado, servida com arroz, couve e laranja.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
      {
        id: 'dish-203',
        name: 'Tapioca de Frango com Requeijão Zero Lactose',
        size: 'Unidade (250g)',
        availableDays: 'Todos os dias',
        price: 12.0,
        description: 'Massa de tapioca artesanal recheada com frango desfiado temperado e requeijão zero lactose.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Hamburgueria Coruja do Campus (Frente Aprígio Veloso UFCG)',
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Aprigio+Veloso+UFCG+Bodocongo',
    openingHours: '18:00 - 02:00',
    hasStudentDiscount: true,
    studentDiscountDetails: 'Combo Estudante UFCG: Burger + Batata por R$ 25,00 após as 21h',
    campusZone: 'Entrada Aprígio Veloso - UFCG',
    coordinates: { x: 25, y: 78 },
    pratoDoDia: 'Burger Smash Especial com Queijo Cheddar Artesanal',
    createdAt: Date.now() - 100000,
    ratings: { 'user-1': 5, 'user-2': 5, 'user-3': 4, 'user-4': 5 },
    dishes: [
      {
        id: 'dish-301',
        name: 'Burger Smash Estudante UFCG',
        size: 'Burger 150g',
        availableDays: 'Quarta a Domingo',
        price: 22.0,
        description: 'Blend bovino 150g, queijo cheddar artesanal, maionese verde e pão brioche tostado na manteiga.',
        isLactoseFree: false,
        isVegan: false,
        isGlutenFree: false,
      },
      {
        id: 'dish-302',
        name: 'Burger Futuro 100% Plant-Based',
        size: 'Burger 160g',
        availableDays: 'Quarta a Domingo',
        price: 26.0,
        description: 'Hambúrguer vegetal, queijo vegano derretido, cebola caramelizada, alface e tomate no pão vegano.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: false,
      },
      {
        id: 'dish-303',
        name: 'Porção Batata Rústica com Páprica',
        size: 'Porção Média (350g)',
        availableDays: 'Todos os dias',
        price: 16.0,
        description: 'Batatas rústicas fofinhas por dentro e crocantes por fora, temperadas com sal marinho e páprica.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
    ],
  },
  {
    id: 'rest-4',
    name: 'Bistrô Bio & Verde - Praça de Alimentação UFCG',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Praca+de+Alimentacao+UFCG+Bodocongo',
    openingHours: '10:00 - 19:00',
    hasStudentDiscount: false,
    studentDiscountDetails: '',
    campusZone: 'Praça de Alimentação UFCG',
    coordinates: { x: 42, y: 35 },
    pratoDoDia: 'Bowl de Açaí Zero Açúcar com Granola Sem Glúten & Frutas',
    createdAt: Date.now() - 50000,
    dishes: [
      {
        id: 'dish-401',
        name: 'Bowl de Açaí Zero Açúcar com Granola Sem Glúten',
        size: 'Bowl 500ml',
        availableDays: 'Segunda a Sábado',
        price: 19.9,
        description: 'Açaí puro batido com banana, acompanhado de granola crocante sem glúten e morangos frescos.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
      {
        id: 'dish-402',
        name: 'Wrap de Húmus com Falafel e Legumes',
        size: 'Wrap (300g)',
        availableDays: 'Segunda a Sábado',
        price: 21.0,
        description: 'Massa leve recheada com bolinhos de falafel assados, pasta de grão de bico, pepino e molho tahine.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: false,
      },
    ],
  },
  {
    id: 'rest-5',
    name: 'Anel Universitário',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Restaurante+Anel+Universitario+UFCG+Bodocongo',
    openingHours: '11:00 - 14:30',
    hasStudentDiscount: true,
    studentDiscountDetails: 'Almoço PF Universitário a R$ 16,00 com apresentação da carteirinha UFCG!',
    campusZone: 'Anel Universitário (Próximo ao Portão Oeste UFCG)',
    coordinates: { x: 38, y: 32 },
    pratoDoDia: 'PF Universitário: Carne de Sol na Manteiga com Macaxeira',
    createdAt: Date.now() - 30000,
    ratings: { 'user-1': 5, 'user-2': 5, 'user-3': 5, 'user-4': 4 },
    reviews: [
      {
        id: 'rev-501',
        userId: 'user-1',
        userName: 'Thiago Medeiros (Eng. Civil)',
        rating: 5,
        comment: 'Melhor opção de almoço no Anel Universitário! A carne de sol com macaxeira é sensacional e o atendimento é muito rápido.',
        createdAt: Date.now() - 86400000 * 1,
      },
      {
        id: 'rev-502',
        userId: 'user-2',
        userName: 'Camila Vasconcelos (Nutrição)',
        rating: 5,
        comment: 'Excelente variedade no almoço executivo e opções veganas deliciosas como a moqueca de banana da terra. Muito perto do portão oeste.',
        createdAt: Date.now() - 86400000 * 3,
      },
    ],
    dishes: [
      {
        id: 'dish-601',
        name: 'Prato Feito (PF) Universitário - Almoço Completo',
        size: 'Prato Executivo (550g)',
        availableDays: 'Segunda a Sábado (Almoço)',
        price: 16.0,
        description: 'Carne de Sol na manteiga ou Frango Grelhado, arroz branco ou integral, feijão caseiro, macaxeira cozida, salada fresca e farofa crocante.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-602',
        name: 'Self-Service sem Balança (Almoço Livre)',
        size: 'Buffet Livre no Almoço',
        availableDays: 'Segunda a Sexta (11h às 14h30)',
        price: 20.0,
        description: 'Acesso liberado ao buffet de almoço com diversas opções de carnes grelhadas, peixes, feijão tropeiro, macarrão, saladas cruas e cozidas.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: false,
      },
      {
        id: 'dish-603',
        name: 'Moqueca Vegana de Banana da Terra & Grão de Bico',
        size: 'Prato Executivo (480g)',
        availableDays: 'Segunda a Sábado (Almoço)',
        price: 18.0,
        description: 'Moqueca aromática no leite de coco natural, banana da terra, grão de bico selecionado, pimentões, azeite de dendê suave e arroz soltinho.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
      {
        id: 'dish-604',
        name: 'Filé de Frango Grelhado com Macaxeira na Manteiga',
        size: 'Prato Executivo (500g)',
        availableDays: 'Segunda a Sábado (Almoço)',
        price: 17.0,
        description: 'Filé de peito de frango marinado com ervas finas, servido com macaxeira amanteigada, arroz, feijão carioca e vinagrete.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-605',
        name: 'Marmitex Executiva de Carne de Sol Acebolada',
        size: 'Marmita Grande (550g)',
        availableDays: 'Segunda a Sábado (Almoço)',
        price: 17.5,
        description: 'Carne de sol desfiada acebolada, arroz soltinho, feijão macáçar temperado, macaxeira cozida e vinagrete.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-606',
        name: 'Jarra de Suco Natural da Fruta (Laranja / Maracujá / Acerola)',
        size: 'Jarra (500ml)',
        availableDays: 'Todos os dias no Almoço',
        price: 7.0,
        description: 'Suco 100% natural da fruta batido na hora, gelado e refrescante para acompanhar a refeição.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: true,
      },
    ],
  },
  {
    id: 'rest-6',
    name: 'Lanchonete do Bosque Central UFCG',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Bosque+UFCG+Bodocongo',
    openingHours: '07:00 - 20:00',
    hasStudentDiscount: true,
    studentDiscountDetails: 'Café expresso de cortesia na compra de pastel gigante com carteirinha UFCG',
    campusZone: 'Bosque Central UFCG',
    coordinates: { x: 65, y: 75 },
    pratoDoDia: 'Pastel Gigante Especial de Frango com Catupiry',
    createdAt: Date.now() - 20000,
    dishes: [
      {
        id: 'dish-701',
        name: 'Pastel Gigante de Frango com Catupiry',
        size: 'Pastel 30cm',
        availableDays: 'Segunda a Sábado',
        price: 14.0,
        description: 'Massa crocante frita na hora, recheada generosamente com frango desfiado bem temperado e catupiry cremoso.',
        isLactoseFree: false,
        isVegan: false,
        isGlutenFree: false,
      },
      {
        id: 'dish-702',
        name: 'Pastel Universitário Vegano de Palmito',
        size: 'Pastel 30cm',
        availableDays: 'Segunda a Sábado',
        price: 13.5,
        description: 'Recheio picadinho de palmito especial, milho doce, azeitonas pretas e tomate italiano.',
        isLactoseFree: true,
        isVegan: true,
        isGlutenFree: false,
      },
    ],
  },
  {
    id: 'rest-7',
    name: 'Restaurante do Centro de Convivência UFCG',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    googleMapsUrl: 'https://maps.google.com/?q=Centro+de+Convivencia+UFCG+Bodocongo',
    openingHours: '10:30 - 16:00',
    hasStudentDiscount: true,
    studentDiscountDetails: '15% de desconto no almoço para alunos de graduação e pós da UFCG',
    campusZone: 'Centro de Convivência UFCG Bodocongó',
    coordinates: { x: 55, y: 58 },
    pratoDoDia: 'Frango Grelhado Suculento com Mix de Legumes no Vapor',
    createdAt: Date.now() - 2000,
    dishes: [
      {
        id: 'dish-1001',
        name: 'Executivo UFCG: Frango Grelhado com Legumes no Vapor',
        size: 'Prato Executivo (480g)',
        availableDays: 'Segunda a Sexta',
        price: 16.0,
        description: 'Peito de frango suculento, arroz de brócolis, feijão preto e mix de legumes cozidos no vapor.',
        isLactoseFree: true,
        isVegan: false,
        isGlutenFree: true,
      },
      {
        id: 'dish-1002',
        name: 'Lasanha Vegetariana de Berinjela e Abobrinha',
        size: 'Porção Individual (400g)',
        availableDays: 'Terça e Quinta',
        price: 17.5,
        description: 'Camadas de berinjela e abobrinha fatiadas, molho artesanal de tomate pelati, queijo muçarela e manjericão.',
        isLactoseFree: false,
        isVegan: false,
        isGlutenFree: true,
      },
    ],
  },
];

export function getStoredRestaurants(): Restaurant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredRestaurants(INITIAL_RESTAURANTS);
      return INITIAL_RESTAURANTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Sync initial restaurants so default data is always updated
      const merged = parsed.map((item) => {
        const initMatch = INITIAL_RESTAURANTS.find((r) => r.id === item.id);
        if (initMatch) {
          return { ...item, ...initMatch };
        }
        return item;
      });
      for (const init of INITIAL_RESTAURANTS) {
        if (!merged.some((r) => r.id === init.id)) {
          merged.push(init);
        }
      }
      return merged;
    }
    saveStoredRestaurants(INITIAL_RESTAURANTS);
    return INITIAL_RESTAURANTS;
  } catch (e) {
    console.error('Error reading stored restaurants:', e);
    return INITIAL_RESTAURANTS;
  }
}

export function saveStoredRestaurants(restaurants: Restaurant[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(restaurants));
  } catch (e) {
    console.error('Error saving restaurants to localStorage:', e);
  }
}

export async function reseedDefaultRestaurantsAsync(): Promise<Restaurant[]> {
  try {
    for (const rest of INITIAL_RESTAURANTS) {
      await setDoc(doc(db, 'restaurants', rest.id), rest);
    }
  } catch (err) {
    console.error('Failed to seed restaurants to Firestore:', err);
  }
  saveStoredRestaurants(INITIAL_RESTAURANTS);
  return INITIAL_RESTAURANTS;
}

export function subscribeToRestaurants(callback: (restaurants: Restaurant[]) => void): () => void {
  const restaurantsRef = collection(db, 'restaurants');

  const unsubscribe = onSnapshot(
    restaurantsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial restaurants to Firestore
        try {
          for (const rest of INITIAL_RESTAURANTS) {
            await setDoc(doc(db, 'restaurants', rest.id), rest);
          }
        } catch (e) {
          console.error('Error seeding initial restaurants to Firestore:', e);
        }
        saveStoredRestaurants(INITIAL_RESTAURANTS);
        callback(INITIAL_RESTAURANTS);
      } else {
        const list: Restaurant[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.name) {
            list.push({ id: docSnap.id, ...data } as Restaurant);
          }
        });

        // Ensure all default restaurants exist in Firestore or update out-of-date defaults
        const existingIds = new Set(list.map((r) => r.id));
        const missingDefaults = INITIAL_RESTAURANTS.filter((r) => !existingIds.has(r.id));

        // If Firestore is completely empty on initial setup, provide defaults locally
        if (list.length === 0) {
          saveStoredRestaurants(INITIAL_RESTAURANTS);
          callback(INITIAL_RESTAURANTS);
          return;
        }

        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        saveStoredRestaurants(list);
        callback(list);
      }
    },
    (err) => {
      console.warn('Firestore listener error or offline mode:', err?.message || err);
      callback(getStoredRestaurants());
    }
  );

  return unsubscribe;
}

export async function addRestaurantAsync(
  newRestaurantData: Omit<Restaurant, 'id' | 'createdAt'>,
  ownerInfo?: { ownerId: string; ownerEmail: string; ownerName: string }
): Promise<Restaurant> {
  const newRestaurant: Restaurant = {
    ...newRestaurantData,
    id: `rest-${Date.now()}`,
    createdAt: Date.now(),
    ownerId: ownerInfo?.ownerId,
    ownerEmail: ownerInfo?.ownerEmail,
    ownerName: ownerInfo?.ownerName,
  };

  try {
    await setDoc(doc(db, 'restaurants', newRestaurant.id), newRestaurant);
  } catch (err) {
    console.error('Failed to write to Firestore, storing locally:', err);
  }

  // Update localStorage as well
  const current = getStoredRestaurants();
  const updated = [newRestaurant, ...current];
  saveStoredRestaurants(updated);

  return newRestaurant;
}

export async function updateRestaurantAsync(
  id: string,
  updatedData: Partial<Restaurant>
): Promise<Restaurant | null> {
  const current = getStoredRestaurants();
  const index = current.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updatedRestaurant = {
    ...current[index],
    ...updatedData,
  };

  try {
    await setDoc(doc(db, 'restaurants', id), updatedRestaurant);
  } catch (err) {
    console.error('Failed to update in Firestore, updating locally:', err);
  }

  current[index] = updatedRestaurant;
  saveStoredRestaurants(current);
  return updatedRestaurant;
}

export async function deleteRestaurantAsync(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'restaurants', id));
  } catch (err) {
    console.error('Failed to delete from Firestore, deleting locally:', err);
  }

  const current = getStoredRestaurants();
  const updated = current.filter((r) => r.id !== id);
  saveStoredRestaurants(updated);
}

export async function deleteDishFromRestaurantAsync(
  restaurantId: string,
  dishId: string
): Promise<Restaurant | null> {
  const current = getStoredRestaurants();
  const index = current.findIndex((r) => r.id === restaurantId);
  if (index === -1) return null;

  const restaurant = current[index];
  if (restaurant.dishes.length <= 2) {
    throw new Error('O restaurante precisa manter pelo menos 2 pratos cadastrados.');
  }

  const updatedDishes = restaurant.dishes.filter((d) => d.id !== dishId);
  const updatedRestaurant = {
    ...restaurant,
    dishes: updatedDishes,
  };

  try {
    await setDoc(doc(db, 'restaurants', restaurantId), updatedRestaurant);
  } catch (err) {
    console.error('Failed to update dish in Firestore:', err);
  }

  current[index] = updatedRestaurant;
  saveStoredRestaurants(current);
  return updatedRestaurant;
}

export async function rateRestaurantAsync(
  restaurantId: string,
  userId: string,
  rating: number
): Promise<Restaurant | null> {
  const current = getStoredRestaurants();
  const index = current.findIndex((r) => r.id === restaurantId);
  if (index === -1) return null;

  const existingRatings = current[index].ratings || {};
  const updatedRatings = {
    ...existingRatings,
    [userId]: rating,
  };

  const updatedRestaurant = {
    ...current[index],
    ratings: updatedRatings,
  };

  try {
    await setDoc(doc(db, 'restaurants', restaurantId), updatedRestaurant);
  } catch (err) {
    console.error('Failed to update rating in Firestore:', err);
  }

  current[index] = updatedRestaurant;
  saveStoredRestaurants(current);
  return updatedRestaurant;
}

export async function addReviewAsync(
  restaurantId: string,
  reviewData: Omit<Review, 'id' | 'createdAt'>
): Promise<Restaurant | null> {
  const current = getStoredRestaurants();
  const index = current.findIndex((r) => r.id === restaurantId);
  if (index === -1) return null;

  const newReview: Review = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    createdAt: Date.now(),
  };

  const existingReviews = current[index].reviews || [];
  const filteredReviews = existingReviews.filter((r) => r.userId !== reviewData.userId);
  const updatedReviews = [newReview, ...filteredReviews];

  const existingRatings = current[index].ratings || {};
  const updatedRatings = {
    ...existingRatings,
    [reviewData.userId]: reviewData.rating,
  };

  const updatedRestaurant: Restaurant = {
    ...current[index],
    reviews: updatedReviews,
    ratings: updatedRatings,
  };

  try {
    await setDoc(doc(db, 'restaurants', restaurantId), updatedRestaurant);
  } catch (err) {
    console.error('Failed to save review in Firestore:', err);
  }

  current[index] = updatedRestaurant;
  saveStoredRestaurants(current);
  return updatedRestaurant;
}
