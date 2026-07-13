export default class CodeCommonUtil {
	/**
 * Get label and class from constant
 */
	public static setFormatOptionSelect(code: string, lists: any[] = [], isSelected: boolean = false): any[] {
		return lists.map((item: any) => ({
			label: item["codeName"],
			value: item["domainCodeValue"],
			selected: isSelected ? item["domainCodeValue"] === code : false,
		}));
	}
}

