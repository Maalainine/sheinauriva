// List of countries with their cities and shipping prices
export const COUNTRIES = [
  {
    name: 'Morocco',
    code: 'MA',
    cities: [
      { name: 'Agadir', shippingPrice: 50 },
      { name: 'Al Hoceïma', shippingPrice: 50 },
      { name: 'Asilah', shippingPrice: 50 },
      { name: 'Azrou', shippingPrice: 50 },
      { name: 'Beni Mellal', shippingPrice: 50 },
      { name: 'Berkane', shippingPrice: 50 },
      { name: 'Berrechid', shippingPrice: 25 },
      { name: 'Casablanca', shippingPrice: 25 },
      { name: 'Chefchaouen', shippingPrice: 50 },
      { name: 'Dakhla', shippingPrice: 50 },
      { name: 'El Jadida', shippingPrice: 25 },
      { name: 'Errachidia', shippingPrice: 50 },
      { name: 'Essaouira', shippingPrice: 50 },
      { name: 'Fès', shippingPrice: 50 },
      { name: 'Figuig', shippingPrice: 50 },
      { name: 'Guelmim', shippingPrice: 50 },
      { name: 'Ifrane', shippingPrice: 50 },
      { name: 'Kenitra', shippingPrice: 25 },
      { name: 'Khemisset', shippingPrice: 25 },
      { name: 'Khenifra', shippingPrice: 50 },
      { name: 'Khouribga', shippingPrice: 50 },
      { name: 'Laâyoune', shippingPrice: 50 },
      { name: 'Larache', shippingPrice: 50 },
      { name: 'Marrakech', shippingPrice: 50 },
      { name: 'Meknès', shippingPrice: 50 },
      { name: 'Mohammedia', shippingPrice: 25 },
      { name: 'Nador', shippingPrice: 50 },
      { name: 'Ouarzazate', shippingPrice: 50 },
      { name: 'Oujda', shippingPrice: 50 },
      { name: 'Rabat', shippingPrice: 25 },
      { name: 'Safi', shippingPrice: 50 },
      { name: 'Salé', shippingPrice: 25 },
      { name: 'Sefrou', shippingPrice: 50 },
      { name: 'Settat', shippingPrice: 25 },
      { name: 'Sidi Ifni', shippingPrice: 50 },
      { name: 'Sidi Kacem', shippingPrice: 25 },
      { name: 'Skhirat', shippingPrice: 25 },
      { name: 'Tanger', shippingPrice: 50 },
      { name: 'Tantan', shippingPrice: 50 },
      { name: 'Tarfaya', shippingPrice: 50 },
      { name: 'Taroudant', shippingPrice: 50 },
      { name: 'Taza', shippingPrice: 50 },
      { name: 'Témara', shippingPrice: 25 },
      { name: 'Tétouan', shippingPrice: 50 },
      { name: 'Tiznit', shippingPrice: 50 },
      { name: 'Youssoufia', shippingPrice: 25 },
      { name: 'Zagora', shippingPrice: 50 },
      { name: 'Merzouga', shippingPrice: 50 },
    ]
  },
  {
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
  }
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
