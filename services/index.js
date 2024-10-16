//  put nutritionix api here
export const searchFood = async query => {
	try {
		const data = await searchFoodQuery(query);
		let exceedLimit = false;
		const formmated = data.map((result, index) => {
			if (!(result?.serving_qty > 0)) {
				exceedLimit = true;
			}
			return {
				id: index,
				name: result?.food_name,
				calories: result?.nf_calories,
				servingQuantity: result?.serving_qty,
				servingUnit: result?.serving_unit,
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
			"x-app-id": process.env.NUTRITIONIX_APP_ID,
			"x-app-key": process.env.NUTRITIONIX_APP_KEY,
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
			"x-app-id": process.env.NUTRITIONIX_APP_ID,
			"x-app-key": process.env.NUTRITIONIX_APP_KEY,
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


export const get_nutrition_from_ai = async (value) => {
	try {
		const response = await fetch(`http://127.0.0.1:8000/get-nutrition-data/?message=${value}`, {
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
	}
};


export const submitImage = async (image) => {
	try {
		const file = new File([await fetch(image.uri).then(response => response.blob())], image.fileName, { type: image.mimeType });
		const data = new FormData();
			data.append('image', file); 
		const response = await fetch('http://127.0.0.1:8000/ask-question/', {
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