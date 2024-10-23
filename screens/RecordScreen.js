import { useEffect, useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';  // for camera icon
import { View, TouchableOpacity, Image } from 'react-native';
import {
	Layout,
	Text,
	Tab,
	TabBar,
	Spinner,
	Autocomplete,
	AutocompleteItem,
	Icon,
	Modal,
	Card,
	Divider,
	IndexPath,
	Select,
	SelectItem,
} from "@ui-kitten/components";
import {
	StyleSheet,
	FlatList,
	SafeAreaView,
	Keyboard,
	Platform,
} from "react-native";
import {
	FocusedStatusBar,
	CustomButton,
	PersonalFoodLabelBar,
	ResultsFoodLabel,
} from "../components";
import { COLORS, FONTS, SIZES, assets, SHADOWS } from "../constants";
import { searchFood, get_nutrition_from_ai, submitImage } from "../services";
import { FOODSUGGESTIONS } from "../constants/foodSuggestions";
import { DailyConsumptionController } from "../firebase/firestore/DailyConsumptionController";
import { PersonalFoodLabelController } from "../firebase/firestore/PersonalFoodLabelController";

const showEvent = Platform.select({
	android: "keyboardDidShow",
	default: "keyboardWillShow",
});

const hideEvent = Platform.select({
	android: "keyboardDidHide",
	default: "keyboardWillHide",
});

const filter = (item, query) =>
	item.title.toLowerCase().includes(query.toLowerCase());
  

const AllTabScreen = ({ navigation, setPersonalFoodLabelData }) => {
	// autocomplete
	const [value, setValue] = useState("");
	const [suggestions, setSuggestions] = useState(FOODSUGGESTIONS);
	const [data, setData] = useState(suggestions);
	const [placement, setPlacement] = useState("bottom");

	const [isAddLoading, setIsAddLoading] = useState(false);
	const [results, setResults] = useState([]);
	const [isSearchBarVisible, setIsSearchBarVisible] = useState(true);
	const [loadingSearch, setLoadingSearch] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [isSuccessTextVisible, setIsSuccessTextVisible] = useState(false);
	const [imageUri, setImageUri] = useState(null);
	const [isRecommended, setIsRecommended] = useState(true);
	const [isRecommendedDescription, setIsRecommendedDescription] = useState("It is rich in protein");

	const [modalDataindex, setModalDataIndex] = useState({
		foodName: "",
		calories: 0,
		protein:0,
		carbs:0,
		fat:0,
		quantity: 0,
		unit: "",
	});
	

	const [modalData, setModalData] = useState({
		foodName: "",
		calories: 0,
		protein:0,
		carbs:0,
		fat:0,
		quantity: 0,
		unit: "",
	});

	const meal = ["Breakfast", "BreakfastSnack", "Lunch", "EveningSnack", "Dinner"];

	const [mealIndex, setMealIndex] = useState(new IndexPath(0));
	const mealDisplayValue = meal[mealIndex.row];

	const unit = ["cup","gram","piece","oz"];
	const calorieMap = {
		'gram': 1, 
		'piece': 100, 
		'cup': 150,
		"oz":  30
	};

	const [unitIndex, setUnitIndex] = useState(new IndexPath(0));
	const UnitDisplayValue = unit[unitIndex.row];	
	// setModalData(modalData.unit = unitIndex);
	// handleModalChange(unit,unitIndex)
	// modalData.unit = unitIndex;

	// const handleModalChange = (field,newValue) => {
	// 	if(field==unit) setUnitIndex(newValue);
	// 	else setQuantityIndex(newValue)
	  
	// 	// Use setModalData to update the modal data immutably
	// 	setModalData((prevModalData) => ({
	// 	  ...prevModalData,    // Spread previous modalData to keep other fields intact
	// 	  [field]: newValue,  // Update only the 'unit' field
	// 	}));
	//   };

	

	const quantity = ["1","2","3","4","5"];

	const [quantityIndex, setQuantityIndex] = useState(new IndexPath(0));
	const QuantityDisplayValue = quantity[quantityIndex.row];
	// modalData.quantity = QuantityDisplayValue;
	// handleModalChange(quantity,QuantityDisplayValue)

	useEffect(() => {
		handleModalChange('unit', UnitDisplayValue); // 'unit' as the field
	  }, [unitIndex]);
	  
	  useEffect(() => {
		handleModalChange('quantity', QuantityDisplayValue); // 'quantity' as the field
	  }, [quantityIndex]);

	useEffect(() => {
		// auto complete
		const keyboardShowListener = Keyboard.addListener(showEvent, () => {
			setPlacement("bottom");
		});

		const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
			setPlacement("bottom");
		});

		return () => {
			keyboardShowListener.remove();
			keyboardHideListener.remove();
		};
	}, []);

	const handleSearch = async () => {
		if (value == null || value == "") {
			return;
		}
		setLoadingSearch(true);
		setIsSearchBarVisible(false);
		
		const { data, error } = await searchFood(value);
		if (error) {
			resetSearchFrom();
			setHasError(true);
			return;
		}
		console.log(data)
		setResults(data);
		setHasError(false);
		setLoadingSearch(false);
	};

	const resetSearchFrom = () => {
		setIsSearchBarVisible(true);
		setResults([]);
		setValue("");
	};

	const handleRecordConsumption = async () => {
		setIsAddLoading(true);
		// record into user daily consumption collection
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth();
		const year = today.getFullYear();
		const todayAsStr = day + "_" + month + "_" + year;
		const hour = today.getHours();
		const minute = today.getMinutes();
		const second = today.getSeconds();
		let currentTime =
			hour.toString().padStart(2, "0") +
			":" +
			minute.toString().padStart(2, "0") +
			":" +
			second.toString().padStart(2, "0");
		
		let calorieMap = {
			'gram': 1, 
			'piece': 100, 
			'cup': 150  
		};

		const newConsumption = {
			foodName: modalData.foodName,
			totalCalories: modalData.calories,
			protein:modalData.protein,
			carbs:modalData.carbs,
			fat:modalData.fat,
			servingQuantity: modalData.quantity,
			servingUnit: modalData.unit,
			time: currentTime,
			dailyConsumptionId: todayAsStr,
		};

		const { success } = await DailyConsumptionController.addDailyConsumption(
			newConsumption,
			todayAsStr,
			meal[mealIndex.row]
		);

		if (success) {
			setIsSuccessTextVisible(true);
			setTimeout(() => {
				setIsAddLoading(false);
				setIsSuccessTextVisible(false);
				// close modal
				setAddConsumptionPanelVisible(false);
			}, 2000);
		}
	};

	// modal
	const [addConsumptionPanelVisible, setAddConsumptionPanelVisible] =
		useState(false);

	const handleAdd = data => {
		// console.log(" Data while handleAdd",data)
		// console.log("calorie Data while handleAdd",data.name)
		if (data) {
			// console.log("inside data")
			// console.log("Modal Data while handleAdd inside",modalData)
			setModalData({
				foodName: data.name,
				calories: data.calories,
				protein:isNaN(data.protein)?0:data.protein,
			    carbs:data.carbs==undefined?1000:data.carbs,
			    fat:data.fat==undefined?0:data.fat, 
				quantity: data.servingQuantity,
				unit: data.servingUnit,
			});
			setModalDataIndex({
				foodName: data.name,
				calories: data.calories,
				protein:isNaN(data.protein)?0:data.protein,
			    carbs:data.carbs==undefined?1000:data.carbs,
			    fat:data.fat==undefined?0:data.fat, 
				quantity: data.servingQuantity,
				unit: data.servingUnit,
			});
			// setIsRecommended(item.is_recomended)
			// setIsRecommendedDescription(item.food_recomendation);
			console.log("Modal Data while handleAdd",modalData)
			setAddConsumptionPanelVisible(true);
		}
	};

	const renderMealOption = (title, index) => {
		return <SelectItem title={title} key={index} />;
	};


	const recalculateNutritionalValues = (updatedModalData) => {
		const { calories, protein, carbs, fat, unit, quantity } = updatedModalData;
		
		 // Debugging:r Log inputs
		//  console.log("Input values: ", {
		// 	calories,
		// 	protein,
		// 	carbs,
		// 	fat,
		// 	unit,
		// 	quantity,
		// 	unitMultiplier: calorieMap[unit],
		//   });
		
		  // Ensure `calorieMap[unit]` exists
		  if (!calorieMap[unit]) {
			console.error(`Unit '${unit}' not found in calorieMap.`);
			return {};
		  }
		  console.log("Result state ",results)

		  const numericQuantity = parseInt(quantity, 10);
		return {
			calories: parseFloat((modalDataindex.calories/100 * calorieMap[unit] * numericQuantity).toFixed(2)),
			protein: parseFloat((modalDataindex.protein/100 * calorieMap[unit] * numericQuantity).toFixed(2)),
			carbs: parseFloat((modalDataindex.carbs/100 * calorieMap[unit] * numericQuantity).toFixed(2)),
			fat: parseFloat((modalDataindex.fat/100 * calorieMap[unit] * numericQuantity).toFixed(2)),
		};
	  };
	
	  // Function to handle any changes in serving size or quantity
	  const handleModalChange = (field, newValue) => {
		setModalData((prevModalData) => {
		  const updatedModalData = {
			...prevModalData,
			[field]: newValue, // Update the specific field (e.g., 'unit', 'quantity')
		  };
	//   console.log("Updated Model data",updatedModalData);
	//   console.log("Updated ModelIndex data",modalDataindex);
		  const recalculatedValues = recalculateNutritionalValues(updatedModalData);
		//   console.log("recalculatedValues Model data",recalculatedValues);
		//   console.log("recalculatedValues ModelIndex data",modalDataindex);
		  return {
			...updatedModalData,
			...recalculatedValues, // Update recalculated values
		  };
		});
	  };
	 


	// autocomplete
	const onSelect = index => {
		const selected = suggestions[index].title;
		setValue(selected);
	};

	const onChangeText = query => {
		setValue(query);
		setSuggestions(FOODSUGGESTIONS.filter(item => filter(item, query)));
		setData(FOODSUGGESTIONS.filter(item => filter(item, query)));
	};

	const renderOption = (item, index) => (
		<AutocompleteItem key={index} title={item.title} />
	);

	const visualSearch = async () => {
		let foodItems = [];
		try {
			// Ensure the camera opens before proceeding
			const image = await openCamera(); 
			setLoadingSearch(true);
			setIsSearchBarVisible(false);
			let response;
			if (image) {
				try {
					response = await submitImage(image);
				} catch (error) {
					console.error("Error submitting image:", error);
					response = null;
				}
				if (response === undefined) {
					console.log("No response received from submitImage()");
				}
			}
			console.log("Response",response.foods);
			if (!response || !response.foods) {
				throw new Error("No foods found in the response.");
			}
			const list_of_foods = [];
			// Iterate over the 'foods' array and push each item to 'list_of_foods'
			response.foods.forEach((food) => {
				list_of_foods.push(food);
			});
	
			try {
				// Use Promise.all to wait for all async operations to finish
				await Promise.all(list_of_foods.map(async (food,index) => {
					await get_nutri_data(food,index);
				}));
				// Set results after all data has been fetched
				console.log("foodItems",foodItems);
				setResults(foodItems);
				setHasError(false);
			} catch (error) {
				resetSearchFrom();
				setHasError(true);
			} finally {
				setLoadingSearch(false);
			}
		} catch (error) {
			console.error("Error in visualSearch:", error);
			setHasError(true);
			setLoadingSearch(false);
		}
	
		// Fetch nutrition Data from DB or AI
		async function get_nutri_data(value,index) {
			// const { data, error } = await searchFood(value);
			// if (error) {
			// 	throw error;
			// }
			// if (true) {
				// If the food item is not found in the database, fetch it from the AI

				const jsonResponse = await get_nutrition_from_ai(value);
				if (jsonResponse !== null)
				{
					const foodItems2 = [
						{
							id: index,
							name: jsonResponse.name,
							calories: parseInt(jsonResponse.calories),
							protein: parseInt(jsonResponse.protein),
							carbs: parseInt(jsonResponse.carbs),
							fat: parseFloat(jsonResponse.fat),
							servingQuantity: "1",
							servingUnit: "cup",
							is_recomended: jsonResponse.is_recommended,
							food_recomendation: jsonResponse.food_recommendation,
						}];
					console.log("check: ", foodItems2[0]);
					foodItems.push(foodItems2[0]);
				}
				
				 // Push AI data to foodItems array
			// }else{
			// 	foodItems.push(data[0]); // Push DB data to foodItems array
			// }
		}
	};

	const openCamera = async () => {
		// Request camera permissions
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (!permissionResult.granted) {
			alert("Permission to access camera is required!");
			return;
		}
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});


		if (!result.canceled) {
			setImageUri(result.assets[0].uri);  // Store the image URI
			return result.assets[0];
		}
	};
	const cancelImage = () => {
		setImageUri(null); // Reset the image URI
		console.log(imageUri);
	};
	// const submitImage = () => {
	// 	alert("Image submitted!"); // Add your logic here for submitting the image
	// };
	const renderIcon = props => (
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
			{/* Search Icon */}
			<TouchableOpacity onPress={() => handleSearch()} style={{ paddingRight: 10 }}>
				<Icon {...props} name="search-outline" />
			</TouchableOpacity>

			{/* Camera Icon */}
			<TouchableOpacity onPress={() => visualSearch()}>
				<Ionicons name="camera-outline" size={28} color={COLORS.primary} />
			</TouchableOpacity>
		</View>
	);

	return (
		<Layout
			style={{
				alignItems: "center",
				width: "100%",
				flex: 1,
			}}
		>
			{isSearchBarVisible ? (
				<Layout
					style={{
						width: "100%",
						paddingHorizontal: "5%",
					}}
				>
					<Text style={styles.queryText}>What are you having today?</Text>
					<Autocomplete
						placeholder="Search for a food"
						value={value}
						placement={placement}
						onChangeText={onChangeText}
						onSelect={onSelect}
						style={styles.autocomplete}
						accessoryRight={renderIcon}
					>
						{data.map(renderOption)}
					</Autocomplete>
					{hasError && (
						<Text style={styles.errorText}>
							Serving quantity must be greater than 0
						</Text>
					)}
					<Layout style={styles.examplesContainer}>
						<Text style={styles.examplesTitle}>Examples: </Text>
						<Text style={styles.examplesText}>- one serving of salad</Text>
						<Text style={styles.examplesText}>
							- chicken rice and ice lemon tea
						</Text>
						<Text style={styles.examplesText}>
							- 1 set of burger and lobster
						</Text>
						<Text style={styles.examplesText}>
							- 2 slices of peanut butter bread and 1 glass of ice coffee
						</Text>
						<Text style={styles.examplesText}>- 1.5 glass of milk</Text>
						<Text style={styles.examplesText}>- 22 fl oz of cappuccino</Text>
						<Text style={styles.examplesText}>- 3 pieces of grilled chicken</Text>
						<Text style={styles.examplesText}>- 2.5 fillet of seabass</Text>
						<Text style={styles.examplesText}>- half serving of lasagna</Text>
						<Text style={styles.examplesText}>- 2 slices of french toast, 4 dumplings and 1 cup of soya milk</Text>
					</Layout>
				</Layout>
			) : (
				<Layout style={styles.resultsContainer}>
					<Text style={styles.resultsText}>
						{`Search Results ${!loadingSearch ? `(${results.length})` : ""}`}
					</Text>
					{!loadingSearch ? (
						<>
							{results.length != 0 ? (
								<>
									<Layout style={{ width: "100%", flex: 1 }}>
										<FlatList
											data={results}
											keyExtractor={item => item.id}
											renderItem={({ item }) => (
												<ResultsFoodLabel
													data={item}
													isRecommended={item.is_recomended}
													isRecommendedDescription={item.food_recomendation}
													onPressAdd={() => handleAdd(item)}
												/>
											)}
											style={{ width: "100%", flex: 1 }}
										/>
									</Layout>

									<Layout style={styles.buttonContainer}>
										<Text style={styles.notText}>
											Not what you looking for?
										</Text>
										<CustomButton
											text={"Try again"}
											backgroundColor={COLORS.gray}
											onPress={() => resetSearchFrom()}
										/>

										<CustomButton
											text={"Create personal food label"}
											backgroundColor={COLORS.primary}
											onPress={() =>
												navigation.navigate("CreateFoodLabelPage", {
													setPersonalFoodLabelData,
												})
											}
										/>
									</Layout>
									<Modal
										visible={isAddLoading || addConsumptionPanelVisible}
										backdropStyle={styles.backdrop}
										onBackdropPress={() => setAddConsumptionPanelVisible(false)}
										style={styles.modal}
									>
										<Card disabled={true} style={styles.modalContent}>
											<Layout style={styles.modalTitle}>
												<Text
													style={{
														fontSize: SIZES.large,
														fontFamily: FONTS.medium,
														color: COLORS.primary,
														fontFamily: FONTS.semiBold,
													}}
												>
													Select Meal
												</Text>
											</Layout>
											<Divider />
											<Layout
												style={{
													justifyContent: "center",
													alignItems: "center",
													paddingVertical: SIZES.font,
												}}
											>
												<Select
													style={styles.mealSelect}
													placeholder="Select a meal"
													value={mealDisplayValue}
													selectedIndex={mealIndex}
													onSelect={index => setMealIndex(index)}
												>
													{meal.map(renderMealOption)}
												</Select>
												<Text style={styles.foodNameText}>
													{modalData.foodName}
												</Text>
												<Text style={styles.leftText}>
													{"Total calories: "}
													<Text
														style={styles.rightText}
													>{`${modalData.calories} kcal`}</Text>
												</Text>
												<Text style={styles.leftText}>
													{"Protein: "}
													<Text
														style={styles.rightText}
													>{`${modalData.protein} gm`}</Text>
												</Text>
												<Text style={styles.leftText}>
													{"Carbs: "}
													<Text
														style={styles.rightText}
													>{`${modalData.carbs} gm`}</Text>
												</Text>
												<Text style={styles.leftText}>
													{"Fats: "}
													<Text
														style={styles.rightText}
													>{`${modalData.fat} gm`}</Text>
												</Text>
												
												<Text style={styles.leftText}>
       											 {"Serving quantity: "}
													<Text style={styles.rightText}>
													<Select
													style={styles.unitSelect}
													placeholder="Select quantity"
													value={QuantityDisplayValue}
													selectedIndex={quantityIndex}

            	
													onSelect={index => setQuantityIndex(index)}
													>
														{quantity.map(renderMealOption)}
													</Select>
													</Text>
												</Text>

												{/* <Text style={styles.leftText}>
													{"Serving quantity: "}
													<Text style={styles.rightText}>
														{modalData.quantity}
													</Text>
												</Text> */}
												<Text style={styles.leftText}>
													{"Serving unit: "}
													<Text style={styles.rightText}>
													<Select
													style={styles.unitSelect}
													placeholder="Select a unit"
												 value={UnitDisplayValue}
													selectedIndex={unitIndex}
													onSelect={index => setUnitIndex(index)}
													>
														{unit.map(renderMealOption)}
													</Select>
													</Text>
												</Text>
											</Layout>
											{isSuccessTextVisible && (
												<Text style={styles.successMessageText}>
													Meal added to daily consumption!
												</Text>
											)}
											<Layout style={styles.addButtonsContainer}>
												<CustomButton
													text={"Cancel"}
													backgroundColor={COLORS.gray}
													flex={1}
													onPress={() => setAddConsumptionPanelVisible(false)}
												/>
												<Layout style={{ width: "5%" }} />
												{!isAddLoading ? (
													<CustomButton
														text={"Add"}
														backgroundColor={COLORS.primary}
														flex={1}
														onPress={() => handleRecordConsumption()}
													/>
												) : (
													<CustomButton
														backgroundColor={COLORS.lightPrimary}
														flex={1}
													>
														<Spinner status="basic" size="small" />
													</CustomButton>
												)}
											</Layout>
										</Card>
									</Modal>
								</>
							) : (
								<Layout style={styles.content}>
									<Image source={assets.magnifierIcon} style={styles.image} />
									<Text
										style={{
											fontFamily: FONTS.bold,
											fontSize: SIZES.extraLarge,
											paddingVertical: SIZES.font,
										}}
									>
										No Results Found
									</Text>
									<Text
										style={{
											textAlign: "center",
											color: COLORS.gray,
											fontFamily: FONTS.regular,
											fontSize: SIZES.font,
											marginBottom: SIZES.font,
										}}
									>
										Please check spelling or {"\n"}
										create a personal food label
									</Text>
									<CustomButton
										text={"Try again"}
										backgroundColor={COLORS.gray}
										paddingHorizontal={SIZES.large}
										borderRadius={SIZES.large}
										width="80%"
										onPress={() => resetSearchFrom()}
									/>
									<CustomButton
										text={"Create Personal Food Label"}
										backgroundColor={COLORS.primary}
										paddingHorizontal={SIZES.large}
										borderRadius={SIZES.large}
										width="80%"
										onPress={() =>
											navigation.navigate("CreateFoodLabelPage", {
												setPersonalFoodLabelData,
											})
										}
									/>
								</Layout>
							)}
						</>
					) : (
						<Layout style={styles.spinner}>
							<Spinner status="primary" size="giant" />
						</Layout>
					)}
				</Layout>
			)}
		</Layout>
	);
};

const MyPersonalFoodLabelTab = ({
	data,
	navigation,
	setPersonalFoodLabelData,
}) => {
	const [isAddLoading, setIsAddLoading] = useState(false);
	const [isSuccessTextVisible, setIsSuccessTextVisible] = useState(false);
	const [modalData, setModalData] = useState({
		foodName: "",
		calories: 0,
	});
	const meal = ["Breakfast", "BreakfastSnack", "Lunch", "EveningSnack", "Dinner"];
	const [mealIndex, setMealIndex] = useState(new IndexPath(0));
	const mealDisplayValue = meal[mealIndex.row];
	const renderMealOption = (title, index) => {
		return <SelectItem title={title} key={index} />;
	};

	// modal
	const [addConsumptionPanelVisible, setAddConsumptionPanelVisible] =
		useState(false);

	const handleAdd = data => {
		if (data) {
			setModalData({
				foodName: data.name,
				calories: data.calories,
			});
			setAddConsumptionPanelVisible(true);
		}
	};

	const handleRecordConsumption = async () => {
		setIsAddLoading(true);
		// record into user daily consumption collection
		const today = new Date();
		const day = today.getDate();
		const month = today.getMonth();
		const year = today.getFullYear();
		const todayAsStr = day + "_" + month + "_" + year;
		const hour = today.getHours();
		const minute = today.getMinutes();
		const second = today.getSeconds();
		let currentTime =
			hour.toString().padStart(2, "0") +
			":" +
			minute.toString().padStart(2, "0") +
			":" +
			second.toString().padStart(2, "0");

		let calorieMap = {
			'gram': 1, 
			'piece': 100, 
			'cup': 150  
		};
		console.log("Handle record ",modalData);
		const newConsumption = {
			foodName: modalData.foodName,
			totalCalories: Math.round(Math.round((modalData.calories)/100) *calorieMap[modalData.unit] * modalData.quantity),
			servingQuantity: modalData.quantity,
			servingUnit: modalData.unit,
			time: currentTime,
			dailyConsumptionId: todayAsStr,
		};
		console.log(newConsumption);
		const { success } = await DailyConsumptionController.addDailyConsumption(
			newConsumption,
			todayAsStr,
			meal[mealIndex.row]
		);

		
		if (success) {
			setIsSuccessTextVisible(true);
			setTimeout(() => {
				setIsAddLoading(false);
				setIsSuccessTextVisible(false);
				// close modal
				setAddConsumptionPanelVisible(false);
				
			}, 2000);
		}
	};

	return (
		<Layout style={styles.foodLabelsContainer}>
			{data.length !== 0 ? (
				<>
					<FlatList
						data={data}
						keyExtractor={item => item.id}
						renderItem={({ item }) => (
							<PersonalFoodLabelBar
								data={item}
								onPressAdd={() => handleAdd(item)}
							/>
						)}
						style={{ width: "100%", flex: 1 }}
					/>
					<Modal
						visible={isAddLoading || addConsumptionPanelVisible}
						backdropStyle={styles.backdrop}
						onBackdropPress={() => setAddConsumptionPanelVisible(false)}
						style={styles.modal}
					>
						<Card disabled={true} style={styles.modalContent}>
							<Layout style={styles.modalTitle}>
								<Text
									style={{
										fontSize: SIZES.large,
										fontFamily: FONTS.medium,
										color: COLORS.primary,
										fontFamily: FONTS.semiBold,
									}}
								>
									Select Meal
								</Text>
							</Layout>
							<Divider />
							<Layout
								style={{
									justifyContent: "center",
									alignItems: "center",
									paddingVertical: SIZES.font,
								}}
							>
								<Select
									style={styles.mealSelect}
									placeholder="Select a meal"
									value={mealDisplayValue}
									selectedIndex={mealIndex}
									onSelect={index => setMealIndex(index)}
								>
									{meal.map(renderMealOption)}
								</Select>
								<Text style={styles.foodNameText}>{modalData.foodName}</Text>
								<Text style={styles.leftText}>
									{"Total calories: "}
									<Text
										style={styles.rightText}
									>{`${modalData.calories} kcal`}</Text>
								</Text>
							</Layout>
							{isSuccessTextVisible && (
								<Text style={styles.successMessageText}>
									Meal added to daily consumption!
								</Text>
							)}
							<Layout style={styles.addButtonsContainer}>
								<CustomButton
									text={"Cancel"}
									backgroundColor={COLORS.gray}
									flex={1}
									onPress={() => setAddConsumptionPanelVisible(false)}
								/>
								<Layout style={{ width: "5%" }} />
								{!isAddLoading ? (
									<CustomButton
										text={"Add"}
										backgroundColor={COLORS.primary}
										flex={1}
										onPress={() => handleRecordConsumption()}
									/>
								) : (
									<CustomButton backgroundColor={COLORS.lightPrimary} flex={1}>
										<Spinner status="basic" size="small" />
									</CustomButton>
								)}
							</Layout>
						</Card>
					</Modal>
				</>
			) : (
				<Layout
					style={{ justifyContent: "center", width: "95%", height: "80%" }}
				>
					<Layout style={styles.content}>
						<Image source={assets.noDataIcon} style={styles.image} />
						<Text
							style={{
								fontFamily: FONTS.bold,
								fontSize: SIZES.extraLarge,
								paddingTop: SIZES.font,
								paddingHorizontal: SIZES.large,
								marginBottom: SIZES.font,
							}}
						>
							Oops, nothing here
						</Text>
						<Text
							style={{
								textAlign: "center",
								color: COLORS.gray,
								fontFamily: FONTS.regular,
								fontSize: SIZES.font,
								marginBottom: SIZES.font,
							}}
						>
							Please create a personal food label
						</Text>
					</Layout>
				</Layout>
			)}
			<Layout style={styles.recordContainer}>
				<CustomButton
					text={"Create Personal Food Label"}
					backgroundColor={COLORS.primary}
					onPress={() =>
						navigation.navigate("CreateFoodLabelPage", {
							setPersonalFoodLabelData: setPersonalFoodLabelData,
						})
					}
				/>
			</Layout>
		</Layout>
	);
};

const RecordScreen = ({ navigation }) => {
	const [tabSelectedIndex, setTabSelectedIndex] = useState(0);
	const [personalFoodLabelData, setPersonalFoodLabelData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	useEffect(() => {
		const fetchFoodLabelData = async () => {
			setIsLoading(true);
			const { success, data } =
				await PersonalFoodLabelController.getFoodLabels();
			if (!success) {
				setIsLoading(false);
				return;
			}
			setPersonalFoodLabelData(data);
			setIsLoading(false);
		};
		fetchFoodLabelData();
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FocusedStatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={true}
			/>

			{!isLoading ? (
				<Layout
					style={{
						alignItems: "center",
						flex: 1,
					}}
				>
					<Layout style={styles.headerContainer}>
						<Text style={styles.header}>Add Daily Consumption</Text>
					</Layout>

					<Layout style={{ width: "100%" }}>
						<TabBar
							selectedIndex={tabSelectedIndex}
							onSelect={index => setTabSelectedIndex(index)}
						>
							<Tab title="All" />
							<Tab title="My Personal Food Labels" />
						</TabBar>
					</Layout>
					{tabSelectedIndex === 0 ? (
						<AllTabScreen
							navigation={navigation}
							setPersonalFoodLabelData={setPersonalFoodLabelData}
						/>
					) : (
						<MyPersonalFoodLabelTab
							data={personalFoodLabelData}
							navigation={navigation}
							setPersonalFoodLabelData={setPersonalFoodLabelData}
						/>
					)}
				</Layout>
			) : (
				<Layout style={styles.spinner}>
					<Spinner status="primary" size="giant" />
				</Layout>
			)}
		</SafeAreaView>
	);
};
const styles = StyleSheet.create({
	queryText: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	autocomplete: {
		marginVertical: 10,
	},
	imagePreviewContainer: {
		marginTop: 10,
		alignItems: 'center',
	},
	imagePreview: {
		width: 200,
		height: 200,
		borderRadius: 10,
	},
	imageActions: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginTop: 10,
	},
	examplesContainer: {
		marginTop: 20,
	},
	examplesTitle: {
		fontWeight: 'bold',
		fontSize: 16,
	},
	examplesText: {
		fontSize: 14,
		marginVertical: 5,
	},
	headerContainer: {
		width: "100%",
		backgroundColor: "#F9F9F9",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: "5%",
		position: "relative", // Added for camera icon positioning
		...SHADOWS.dark,
	},
	cameraIcon: {
		position: "absolute",
		right: 20, // Adjust the position of the icon
		top: "50%",
		transform: [{ translateY: -10 }],
	},
	headerContainer: {
		width: "100%",
		backgroundColor: "#F9F9F9",
		alignItems: "center",
		paddingVertical: "5%",
		...SHADOWS.dark,
	},
	header: {
		color: COLORS.primary,
		fontFamily: FONTS.bold,
		fontSize: SIZES.large,
	},
	addButtonsContainer: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	foodNameText: {
		fontFamily: FONTS.bold,
		fontSize: SIZES.large,
		paddingVertical: SIZES.base,
		width: "100%",
	},
	leftText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.medium,
		width: "100%",
		paddingVertical: SIZES.base,
	},
	rightText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.medium,
		color: COLORS.gray,
	},
	mealSelect: {
		fontFamily: FONTS.font,
		fontSize: SIZES.medium,
		width: "100%",
		marginBottom: SIZES.base,
	},
	unitSelect: {
		fontFamily: FONTS.font,
		fontSize: SIZES.medium,
		width: "30%",
		marginBottom: SIZES.base,
		minWidth:120
	},
	content: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
	image: {
		resizeMode: "contain",
		height: 150,
	},
	foodLabelsContainer: {
		paddingVertical: SIZES.base,
		alignItems: "center",
		width: "100%",
		flex: 1,
		paddingBottom: 80,
	},
	recordContainer: {
		position: "absolute",
		width: "100%",
		bottom: 0,
		paddingVertical: SIZES.font,
		paddingHorizontal: "10%",
	},
	spinner: {
		backgroundColor: "white",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	queryText: {
		fontFamily: FONTS.semiBold,
		fontSize: SIZES.large,
		paddingVertical: SIZES.medium,
	},
	autocomplete: {},
	resultsContainer: {
		width: "100%",
		paddingHorizontal: "5%",
		paddingVertical: SIZES.extraLarge,
		flex: 1,
	},
	resultsText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.medium,
	},
	idvContainer: {
		paddingVertical: SIZES.base,
	},
	buttonContainer: {
		marginTop: "auto",
		paddingTop: SIZES.base,
	},
	notText: {
		fontFamily: FONTS.medium,
		paddingBottom: SIZES.small,
		textAlign: "center",
		fontSize: SIZES.font,
		color: COLORS.error,
	},
	spinner: {
		backgroundColor: "white",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	backdrop: {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modal: {
		width: "85%",
	},
	modalContent: {
		flex: 1,
		display: "flex",
		justifyContent: "center",
		alignContent: "center",
	},
	modalTitle: {
		justifyContent: "center",
		alignItems: "center",
		paddingBottom: SIZES.font,
	},
	examplesTitle: {
		paddingTop: SIZES.font,
		fontFamily: FONTS.semiBold,
		fontSize: SIZES.large,
	},
	examplesText: {
		paddingVertical: 4,
		fontFamily: FONTS.regular,
		fontSize: SIZES.font,
		color: COLORS.gray,
	},
	successMessageText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.font,
		color: COLORS.primary,
		paddingBottom: SIZES.small,
	},
	errorText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.small,
		color: COLORS.error,
		paddingTop: SIZES.base,
	},
});
export default RecordScreen;
