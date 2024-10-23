//  put nutritionix api here
const url='http://127.0.0.1:8000'
export const searchFood = async query => {
	try {
		const data = await searchFoodQuery(query);
		let exceedLimit = false;
		const formmated = data.map((result, index) => {
			if (!(result?.serving_qty > 0)) {
				exceedLimit = true;
			}
			// const recomendation = await get_recomendation(result?.food_name);
			// console.log("output",recomendation);
			// console.log("output",recomendation.is_recomended);
			// console.log("output",recomendation.food_recomendation);
			return {
				id: index,
				name: result?.food_name,
				calories: result?.nf_calories,
				protein:result?.nf_protein,
				carbs:result?.nf_total_carbohydrate,
				fat:result?.nf_total_fat,
				servingQuantity: result?.serving_qty,
				servingUnit: result?.serving_unit,
				// is_recomended: recomendation?.is_recomended,
				// food_recomendation: recomendation?.food_recomendation,
			};
		});
		return !exceedLimit
			? { data: formmated, error: false }
			: { data: [], error: true };
	} catch (error) {
		console.log(error); //idk why must include this line for android to work
		console.log("Not found");
		return { data: [], error: false };
	}
};

const filter = (item, query) => {
	return item.food_name.toLowerCase().includes(query.toLowerCase());
};

const searchFoodQuery = async query => {
	const requestOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"x-app-id": "7c877b4e",
			"x-app-key": "8c4d2b6275a0df739b1835f4310397c0",
		},
		body: JSON.stringify({
			query: `${query}`,
			timezone: "US/Eastern",
		}),
	};
	try {
		const response = await fetch(
			"https://trackapi.nutritionix.com/v2/natural/nutrients",
			requestOptions
		);
		// console.log(requestOptions);
		const data = await response.json();
		return data.foods;
	} catch (error) {
		console.log(error);
	}
};

export const autoComplete = async query => {
	try {
		const data = await autoCompleteQuery(query);
		return data.filter(item => filter(item, query));
	} catch (error) {
		console.log(error);
		return [];
	}
};

const autoCompleteQuery = async query => {
	const url = `https://trackapi.nutritionix.com/v2/search/instant?query=${query}?common=true?locale=en_US?self=false`;
	const requestOptions = {
		headers: {
			"x-app-id": "7c877b4e",
			"x-app-key": "8c4d2b6275a0df739b1835f4310397c0",
		},
	};
	try {
		const response = await fetch(url, requestOptions);
		const data = await response.json();

		return data.common;
	} catch (error) {
		console.log(error);
	}
};


export const get_nutrition_from_ai = async (value,medicalCondition) => {
	const query = JSON.stringify({ 
		food: value,
		medicalConditions: medicalCondition,
	 });
	try {
		const response = await fetch(`${url}/get-nutrition-data/?message=${query}`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
			},
		})
		if (!response.ok) {
			throw new Error(`Non-200 response: ${response.statusText}`);
		}
		const jsonResponse =  await response.json();
		console.log(jsonResponse);
		return jsonResponse;
	} catch (error) {
		console.error("Error submitting image:", error);
		return null
	}
};


export const submitImage = async (image) => {
	try {
		const file = new File([await fetch(image.uri).then(response => response.blob())], image.fileName, { type: image.mimeType });
		const data = new FormData();
			data.append('image', file); 
		const response = await fetch(`${url}/scan-image/`, {
			method: 'POST',
			body:data,
			headers: {
				'Accept': 'application/json',
			}
		})
		if (!response.ok) {
			throw new Error(`Non-200 response: ${response.statusText}`);
		}
		const dataa = await response.json();
		// Process the response data
		return dataa;
	} catch (error) {
		console.error("Error submitting image:", error);
	}
};




const get_recomendation = async  (value) => {
	console.log("in get reco function",value);
	// const query = ```
	// 	{"food":"${value}"}
	// ```
	const query = JSON.stringify({ food: value });
	try {
		const response = await fetch(`${url}/get-recomendation/?message=${query}`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
			},
		})
		if (!response.ok) {
			throw new Error(`Non-200 response: ${response.statusText}`);
		}
		const jsonResponse =  await response.json();
		console.log(jsonResponse);
		return jsonResponse;	
	} catch (error) {
		console.error("Error getting recomendation:", error);
	}
};