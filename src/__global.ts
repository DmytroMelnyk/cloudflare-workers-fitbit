interface Date {
	fitbitFormat(): String;
	subtract(days: number): Date;
}

Date.prototype.fitbitFormat = function (): string {
	const year = this.getFullYear();
	const month = (this.getMonth() + 1).toString().padStart(2, '0');
	const day = this.getDate().toString().padStart(2, '0');

	return `${year}-${month}-${day}`;
};

Date.prototype.subtract = function (days: number): Date {
	const copy = new Date(this.getTime());
	copy.setDate(copy.getDate() - days);
	return copy;
};