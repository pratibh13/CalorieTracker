import { useEffect, useRef, useState } from "react";
import { Layout, Text, Avatar, Spinner } from "@ui-kitten/components";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import { FocusedStatusBar, HomePageIcon, CustomButton } from "../components";
import { COLORS, FONTS, SHADOWS, SIZES, assets } from "../constants";
import { VictoryPie } from "victory-native";
import DateComponent from "../components/DateComponent";
import {
	calculateCaloriesNeeded,
	calculateRemainingCalories,
	calculateTotalCaloriesConsumed,
	generateWeek,
} from "../utils";
import { UserController } from "../firebase/firestore/UserController";
import { DailyConsumptionController } from "../firebase/firestore/DailyConsumptionController";

const MiddleLabel = ({ caloriesRemaining }) => {
	return (
		<Layout style={styles.midLabel}>
			<Text style={styles.caloriesText}>{caloriesRemaining}</Text>
			<Text style={styles.remainingText}>Remaining</Text>
		</Layout>
	);
};
const HomeScreen = ({ navigation }) => {
	const [isHistoryLoading, setIsHistoryLoading] = useState(true);
	const [dates, setDates] = useState([
		{
			id: 7,
			dayOfWeek: "Wed",
			dayOfMonth: "30",
			isFocused: true,
		},
	]);

	const [baseGoal, setBaseGoal] = useState(2940);
	const [food, setFood] = useState(370);
	const [exercise, setExercise] = useState(0);

	// Macronutrient state variables
	const [protein, setProtein] = useState(0);
	const [carbs, setCarbs] = useState(0);
	const [fats, setFats] = useState(0);
	

	const focusDate = id => {
		const temp = [];
		dates.forEach(d => {
			if (d.id === id) {
				temp.push({ ...d, isFocused: true });
			} else {
				temp.push({ ...d, isFocused: false });
			}
		});
		setDates(temp);
	};

	const [history, setHistory] = useState({
		breakfast: [],
		breakfastSnack:[],
		lunch: [],
		eveningSnack:[],
		dinner: [],
	});

	// user details
	const [name, setName] = useState("");
	const [isMale, setIsMale] = useState(true);

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const temp = await UserController.fetchData();
				setName(temp.displayName);
				if (temp.gender === "male") {
					setIsMale(true);
				} else {
					setIsMale(false);
				}
				let activityLevelInCalories = 0;
				if (temp.activityLevel === "Not Very Active") {
					activityLevelInCalories = 0;
				} else if (temp.activityLevel === "Lightly Active") {
					activityLevelInCalories = 200;
				} else if (temp.activityLevel === "Active") {
					activityLevelInCalories = 400;
				} else {
					activityLevelInCalories = 600;
				}
				return {
					isMale: temp.gender == "male" ? true : false,
					weight: temp.weight,
					height: temp.height,
					age: temp.age,
					activityLevel: activityLevelInCalories,
				};
			} catch (error) {
				console.log(error);
			}
		};
		const fetchHistory = async ({
			isMale,
			weight,
			height,
			age,
			activityLevel,
		}) => {
			try {
				const today = new Date();
				const date = today.getDate();
				const month = today.getMonth();
				const year = today.getFullYear();
				generateWeek(today);
				setDates(generateWeek(today));
				const todayAsStr = date + "_" + month + "_" + year;
				const history = await DailyConsumptionController.getDailyConsumption(
					todayAsStr
				);
				console.log("History in HomeScreen",history);
				setHistory(history);
				let foodConsumed = calculateTotalCaloriesConsumed(
					history.breakfast,
					history.breakfastSnack,
					history.lunch,
					history.eveningSnack,
					history.dinner
				);
				setBaseGoal(calculateCaloriesNeeded(isMale, weight, height, age));
				setFood(foodConsumed.calorie);
				setProtein(foodConsumed.protein)
				setCarbs(foodConsumed.carbs)
				setFats(foodConsumed.fat)
				setExercise(activityLevel);

			

				setIsHistoryLoading(false);
			} catch (error) {
				console.log(error);
			}
		};
		fetchUserData().then(data => {
			fetchHistory(data);
		});
	}, []);

	// for scroll view
	const scrollViewRef = useRef();

	

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<FocusedStatusBar
				barStyle="dark-content"
				backgroundColor="transparent"
				translucent={true}
			/>
			{!isHistoryLoading ? (
				<>
					<Layout
						style={{
							width: "100%",
							alignItems: "center",
							padding: SIZES.font,
						}}
					>
						<Layout
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								width: "90%",
								marginBottom: SIZES.large,
								paddingTop: "5%",
							}}
						>
							<Layout>
								<Text
									style={{
										fontFamily: FONTS.regular,
										fontSize: SIZES.font,
										color: COLORS.gray,
										paddingBottom: SIZES.font,
									}}
								>
									Good Morning!
								</Text>
								<Text
									style={{
										fontFamily: FONTS.bold,
										fontSize: SIZES.extraLarge,
									}}
								>
									{name}
								</Text>
							</Layout>
							<Avatar
								source={isMale ? assets.avatarMale : assets.avatarFemale}
								size="giant"
							/>
						</Layout>

						<Layout style={{ height: 100 }}>
							<FlatList
								horizontal={true}
								data={dates}
								renderItem={({ item }) => (
									<DateComponent date={item} onPress={focusDate} />
								)}
								ref={scrollViewRef}
								onContentSizeChange={() =>
									scrollViewRef.current.scrollToEnd({ animated: true })
								}
								keyExtractor={item => item.id}
								// style={{ width: "100%" }}
							/>
						</Layout>

						<Layout
							style={{
								borderRadius: SIZES.font,
								...SHADOWS.dark,
							}}
						>
							<Layout
								style={{
									padding: SIZES.font,
									paddingBottom: 0,
								}}
							>
								<Text
									style={{
										fontFamily: FONTS.bold,
										fontSize: SIZES.large,
									}}
								>
									Daily Calories
								</Text>
								<Text
									style={{
										fontFamily: FONTS.regular,
										fontSize: SIZES.font,
									}}
								>
									Calories = Protein + Carbs + Fats 
								</Text>
							</Layout>
							<Layout
								style={{
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
								}}
							>
								<Layout
									style={{
										justifyContent: "center",
										alignItems: "center",
										width: "55%",
									}}
								>
									<VictoryPie
										data={[
											{
												x: "Consumed",
												y: (food / (baseGoal + exercise)) * 360,
											},
											{
												x: "Remaining",
												y:
													(calculateRemainingCalories(
														baseGoal,
														food,
														protein,
														carbs,
														fats,
														exercise
													) /
														(baseGoal + exercise)) *
													360,
											},
										]}
										width={200}
										height={250}
										innerRadius={70}
										labels={() => null}
										style={{
											data: {
												fill: ({ datum }) => {
													return datum.x === "Consumed"
														? COLORS.primary
														: "#e4e6eb";
												},
											},
										}}
									/>
									<MiddleLabel
										caloriesRemaining={calculateRemainingCalories(
											baseGoal,
											food,
											exercise
										)}
									/>
								</Layout>



								<Layout
									style={{
										width: "45%",
									}}
								>
									<HomePageIcon
										source={assets.flagIcon}
										title="Protein"
										data={protein}
										total={Math.round((baseGoal * 0.35) / 4)}
									/>
									<HomePageIcon
										source={assets.eatIcon}
										title="Carbs"
										data={carbs}
										total={Math.round((baseGoal * 0.2) / 4)}
									/>
									<HomePageIcon
										source={assets.fireIcon}
										title="Fats"
										data={fats}
										total={Math.round((baseGoal * 0.45) / 9)}
									/>
								</Layout>
							</Layout>
							
					
						</Layout>
					</Layout>
					<Layout style={styles.button}>
						<CustomButton
							text={"View History"}
							backgroundColor={COLORS.primary}
							onPress={() =>
								navigation.navigate("FoodHistoryPage", {
									data: history,
									setHistory,
									setFood,
								})
							}
						></CustomButton>
					</Layout>
				</>
			) : (
				<Layout style={styles.spinner}>
					<Spinner status="primary" size="giant" />
				</Layout>
			)}
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	spinner: {
		backgroundColor: "white",
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	midLabel: {
		position: "absolute",
		alignItems: "center",
	},
	caloriesText: {
		fontFamily: FONTS.bold,
		fontSize: SIZES.extraLarge,
		color: "black",
	},
	remainingText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.small,
		color: COLORS.gray,
	},
	lineChart: {
		width: 123,
		height: 200,
	},
	button: {
		width: "100%",
		paddingHorizontal: "8%",
		marginTop: "auto",
	},
});
