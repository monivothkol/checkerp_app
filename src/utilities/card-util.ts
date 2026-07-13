export default class CardUtil {
    	/**
	 * Get label and class from constant
	 */
	public static getLabelAndClass(code: string, constant: any[]): Description {
		// Support both single value (string) and array of values (string[])
		const found = constant.find(item => Array.isArray(item.value)
			? (item.value as string[]).includes(code)
			: item.value === code);
		return found ? { label: found.label, class: found.class } : { label: code, class: "" };
	}
}
interface Description {
	label: string;
	class: string;
}