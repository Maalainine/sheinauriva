// List of countries with their cities and shipping prices
export const COUNTRIES = [
  {
    name: 'Morocco',
    nameAr: 'المغرب',
    code: 'MA',
    cities: [
      { name: 'Agadir', nameAr: 'أكادير', shippingPrice: 50 },
      { name: 'Al Hoceïma', nameAr: 'الحسيمة', shippingPrice: 50 },
      { name: 'Asilah', nameAr: 'أصيلة', shippingPrice: 50 },
      { name: 'Azrou', nameAr: 'أزرو', shippingPrice: 50 },
      { name: 'Beni Mellal', nameAr: 'بني ملال', shippingPrice: 50 },
      { name: 'Berkane', nameAr: 'بركان', shippingPrice: 50 },
      { name: 'Berrechid', nameAr: 'برشيد', shippingPrice: 25 },
      { name: 'Casablanca', nameAr: 'الدار البيضاء', shippingPrice: 25 },
      { name: 'Chefchaouen', nameAr: 'شفشاون', shippingPrice: 50 },
      { name: 'Dakhla', nameAr: 'الداخلة', shippingPrice: 50 },
      { name: 'El Jadida', nameAr: 'الجديدة', shippingPrice: 25 },
      { name: 'Errachidia', nameAr: 'الراشيدية', shippingPrice: 50 },
      { name: 'Essaouira', nameAr: 'الصويرة', shippingPrice: 50 },
      { name: 'Fès', nameAr: 'فاس', shippingPrice: 50 },
      { name: 'Figuig', nameAr: 'فجيج', shippingPrice: 50 },
      { name: 'Guelmim', nameAr: 'كلميم', shippingPrice: 50 },
      { name: 'Ifrane', nameAr: 'إفران', shippingPrice: 50 },
      { name: 'Kenitra', nameAr: 'القنيطرة', shippingPrice: 25 },
      { name: 'Khemisset', nameAr: 'الخميسات', shippingPrice: 25 },
      { name: 'Khenifra', nameAr: 'خنيفرة', shippingPrice: 50 },
      { name: 'Khouribga', nameAr: 'خريبكة', shippingPrice: 50 },
      { name: 'Laâyoune', nameAr: 'العيون', shippingPrice: 50 },
      { name: 'Larache', nameAr: 'العرائش', shippingPrice: 50 },
      { name: 'Marrakech', nameAr: 'مراكش', shippingPrice: 50 },
      { name: 'Meknès', nameAr: 'مكناس', shippingPrice: 50 },
      { name: 'Mohammedia', nameAr: 'المحمدية', shippingPrice: 25 },
      { name: 'Nador', nameAr: 'الناظور', shippingPrice: 50 },
      { name: 'Ouarzazate', nameAr: 'ورزازات', shippingPrice: 50 },
      { name: 'Oujda', nameAr: 'وجدة', shippingPrice: 50 },
      { name: 'Rabat', nameAr: 'الرباط', shippingPrice: 25 },
      { name: 'Safi', nameAr: 'آسفي', shippingPrice: 50 },
      { name: 'Salé', nameAr: 'سلا', shippingPrice: 25 },
      { name: 'Sefrou', nameAr: 'صفرو', shippingPrice: 50 },
      { name: 'Settat', nameAr: 'سطات', shippingPrice: 25 },
      { name: 'Sidi Ifni', nameAr: 'سيدي إفني', shippingPrice: 50 },
      { name: 'Sidi Kacem', nameAr: 'سيدي قاسم', shippingPrice: 25 },
      { name: 'Skhirat', nameAr: 'الصخيرات', shippingPrice: 25 },
      { name: 'Tanger', nameAr: 'طنجة', shippingPrice: 50 },
      { name: 'Tantan', nameAr: 'طانطان', shippingPrice: 50 },
      { name: 'Tarfaya', nameAr: 'طرفاية', shippingPrice: 50 },
      { name: 'Taroudant', nameAr: 'تارودانت', shippingPrice: 50 },
      { name: 'Taza', nameAr: 'تازة', shippingPrice: 50 },
      { name: 'Témara', nameAr: 'تمارة', shippingPrice: 25 },
      { name: 'Tétouan', nameAr: 'تطوان', shippingPrice: 50 },
      { name: 'Tiznit', nameAr: 'تزنيت', shippingPrice: 50 },
      { name: 'Youssoufia', nameAr: 'اليوسفية', shippingPrice: 25 },
      { name: 'Zagora', nameAr: 'زاكورة', shippingPrice: 50 },
      { name: 'Merzouga', nameAr: 'مرزوقة', shippingPrice: 50 },
    ]
  },
  /*{
    name: 'Mauritania',
    code: 'MR',
    cities: [
      { name: 'Nouakchott', shippingPrice: 100 },
      { name: 'Nouadhibou', shippingPrice: 120 },
      { name: 'Rosso', shippingPrice: 130 },
      { name: 'Zouérat', shippingPrice: 150 },
      { name: 'Atar', shippingPrice: 140 },
      { name: 'Kiffa', shippingPrice: 130 },
      { name: 'Kaédi', shippingPrice: 125 },
      { name: 'Néma', shippingPrice: 150 },
      { name: 'Aïoun', shippingPrice: 140 },
      { name: 'Tidjikja', shippingPrice: 145 }
    ]
  }*/
] as const;

// Default city (first city of the first country)
export const DEFAULT_CITY = COUNTRIES[0].cities[0].name;

// Get cities by country code
export const getCitiesByCountry = (countryCode: string) => {
  const country = COUNTRIES.find(c => c.code === countryCode);
  return country ? country.cities : [];
};

// Get city by name and country code
export const getCity = (cityName: string, countryCode: string) => {
  const cities = getCitiesByCountry(countryCode);
  return cities.find(city => city.name === cityName);
};
