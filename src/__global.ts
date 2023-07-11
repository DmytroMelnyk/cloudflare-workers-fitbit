interface Date {
	fitbitFormat(): String;
}

Date.prototype.fitbitFormat = function (): string {
	const year = this.getFullYear();
	const month = (this.getMonth() + 1).toString().padStart(2, '0');
	const day = this.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
};