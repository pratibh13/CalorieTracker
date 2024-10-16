import { Layout, Text, Input, Spinner } from "@ui-kitten/components";
import { useState } from "react";
import { Keyboard, TouchableWithoutFeedback, StyleSheet } from "react-native";
import { FocusedStatusBar, CustomButton, BackButton } from "../components";
import { COLORS, FONTS, SIZES, SHADOWS } from "../constants";
import { PersonalFoodLabelController } from "../firebase/firestore/PersonalFoodLabelController";

const CreatePersonalFoodLabelScreen = ({ navigation, route }) => {
	const [errorText, setErrorText] = useState("");
	const [labelName, setLabelName] = useState("");
	const [calories, setCalories] = useState("");
	const { setPersonalFoodLabelData } = route?.params;
	const [createLoading, setCreateLoading] = useState(false);
	const [successMessageVisible, setSuccessMessageVisible] = useState(false);

	const handleCreate = async () => {
		try {
			setCreateLoading(true);
			const newData = {
				name: labelName,
				calories: +calories,
			};
			const { success, docId, error } =
				await PersonalFoodLabelController.createFoodLabel(newData);
			if (!success) {
				setErrorText(error);
				setCreateLoading(false);
				return;
			}
			setPersonalFoodLabelData(prev => [
				{
					...newData,
					id: docId,
				},
				...prev,
			]);
			setErrorText("");
			setCreateLoading(false);
			// clear inputs
			setLabelName("");
			setCalories("");
			setSuccessMessageVisible(true);
			setTimeout(() => {
				setSuccessMessageVisible(false);
			}, 1000);
		} catch (error) {
			console.log(error);
			setCreateLoading(false);
		}
	};

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<Layout style={styles.page}>
				<FocusedStatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
				<BackButton
					onPress={() => navigation.goBack()}
					color={COLORS.primary}
					backgroundColor="transparent"
					top={8}
					paddingLeft={SIZES.large}
				/>
				<Layout style={styles.headerContainer}>
					<Text style={styles.header}>Create Personal Food Label</Text>
				</Layout>

				<Layout style={styles.contentContainer}>
					<Layout style={styles.inputContainer}>
						<Layout style={styles.labelInput}>
							<Text style={styles.text}>Food Name</Text>
							<Input
								style={styles.input}
								placeholder="John Doe's Chicken Rice"
								value={labelName}
								autoCapitalize={false}
								onChangeText={nextValue => setLabelName(nextValue)}
							/>
						</Layout>
						<Layout style={styles.labelInput}>
							<Text style={styles.text}>Calories (in kcal)</Text>
							<Input
								style={styles.input}
								placeholder="500"
								keyboardType="numeric"
								value={calories}
								onChangeText={nextValue => setCalories(nextValue)}
							/>
						</Layout>
						{errorText && (
							<Layout style={styles.errorContainer}>
								<Text style={styles.errorText}>{errorText}</Text>
							</Layout>
						)}
						{successMessageVisible && (
							<Layout style={styles.successMessageContainer}>
								<Text style={styles.successMessageText}>
									{"Personal food label created!"}
								</Text>
							</Layout>
						)}
					</Layout>
				</Layout>
				<Layout style={styles.buttonContainer}>
					{!createLoading ? (
						<CustomButton
							text={"Create"}
							backgroundColor={COLORS.primary}
							borderRadius={SIZES.large}
							onPress={handleCreate}
						/>
					) : (
						<CustomButton backgroundColor={COLORS.lightPrimary}>
							<Spinner status="basic" size="small" />
						</CustomButton>
					)}
				</Layout>
			</Layout>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
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
	contentContainer: {
		width: "100%",
		paddingHorizontal: "7.5%",
		flex: 1,
		justifyContent: "center",
	},
	text: {
		fontFamily: FONTS.regular,
		fontSize: SIZES.font,
		paddingLeft: SIZES.font,
		paddingBottom: 5,
	},
	input: {
		...SHADOWS.light,
		marginBottom: SIZES.large,
	},
	buttonContainer: {
		width: "100%",
		paddingHorizontal: "7.5%",
	},
	inputContainer: {
		paddingBottom: "20%",
	},
	labelInput: {
		width: "100%",
	},
	errorContainer: {
		width: "100%",
	},
	errorText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.small,
		color: COLORS.error,
		paddingTop: SIZES.base,
	},
	successMessageContainer: {
		width: "100%",
	},
	successMessageText: {
		fontFamily: FONTS.medium,
		fontSize: SIZES.small,
		color: COLORS.primary,
		paddingTop: SIZES.base,
	},
	page: {
		flex: 1,
		width: "100%",
	},
});

export default CreatePersonalFoodLabelScreen;
