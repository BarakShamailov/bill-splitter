/**
 * Bill Splitter Calculator
 * All logic runs in the browser - no server needed!
 */

class BillCalculator {
    constructor() {
        this.persons = {};      // name -> {name, group, categories, paid, owes, balance}
        this.categories = {};   // name -> {name, participants, total, payments}
        this.couples = {};      // group_name -> [person names]
    }

    addPerson(name, coupleGroup = null) {
        this.persons[name] = {
            name: name,
            group: coupleGroup,
            categories: [],
            paid: 0,
            owes: 0,
            balance: 0
        };

        if (coupleGroup) {
            if (!this.couples[coupleGroup]) {
                this.couples[coupleGroup] = [];
            }
            if (!this.couples[coupleGroup].includes(name)) {
                this.couples[coupleGroup].push(name);
            }
        }
    }

    addCategory(name, participants, payments) {
        const total = Object.values(payments).reduce((sum, val) => sum + val, 0);

        this.categories[name] = {
            name: name,
            participants: participants,
            total: total,
            payments: payments
        };

        participants.forEach(pName => {
            if (this.persons[pName]) {
                this.persons[pName].categories.push(name);
            }
        });
    }

    calculate() {
        // Reset balances
        Object.values(this.persons).forEach(p => {
            p.owes = 0;
            p.paid = 0;
            p.balance = 0;
        });

        const categoryDetails = {};

        // Calculate what each person owes per category
        Object.entries(this.categories).forEach(([catName, cat]) => {
            const share = cat.participants.length > 0
                ? cat.total / cat.participants.length
                : 0;

            categoryDetails[catName] = {
                total: cat.total,
                participantsCount: cat.participants.length,
                sharePerPerson: Math.round(share * 100) / 100,
                participants: cat.participants,
                payments: cat.payments
            };

            // Each participant owes their share
            cat.participants.forEach(pName => {
                if (this.persons[pName]) {
                    this.persons[pName].owes += share;
                }
            });

            // Credit those who paid
            Object.entries(cat.payments).forEach(([pName, amount]) => {
                if (this.persons[pName]) {
                    this.persons[pName].paid += amount;
                }
            });
        });

        // Calculate individual balances
        Object.values(this.persons).forEach(p => {
            p.balance = Math.round((p.paid - p.owes) * 100) / 100;
        });

        // Apply couple netting
        const entityBalances = {};
        const entityMembers = {};
        const assigned = new Set();

        Object.entries(this.couples).forEach(([groupName, members]) => {
            let groupBalance = 0;
            members.forEach(m => {
                if (this.persons[m]) {
                    groupBalance += this.persons[m].balance;
                }
            });
            entityBalances[groupName] = Math.round(groupBalance * 100) / 100;
            entityMembers[groupName] = members;
            members.forEach(m => assigned.add(m));
        });

        Object.entries(this.persons).forEach(([pName, p]) => {
            if (!assigned.has(pName)) {
                entityBalances[pName] = p.balance;
                entityMembers[pName] = [pName];
            }
        });

        // Minimize transfers
        const transfers = this._minimizeTransfers(entityBalances);

        // Build couple details
        const coupleDetails = {};
        Object.entries(this.couples).forEach(([groupName, members]) => {
            let totalPaid = 0;
            let totalOwes = 0;
            members.forEach(m => {
                if (this.persons[m]) {
                    totalPaid += this.persons[m].paid;
                    totalOwes += this.persons[m].owes;
                }
            });
            coupleDetails[groupName] = {
                members: members,
                totalPaid: Math.round(totalPaid * 100) / 100,
                totalOwes: Math.round(totalOwes * 100) / 100,
                netBalance: Math.round((totalPaid - totalOwes) * 100) / 100
            };
        });

        // Build person details
        const personDetails = {};
        Object.values(this.persons).forEach(p => {
            personDetails[p.name] = {
                name: p.name,
                group: p.group,
                paid: Math.round(p.paid * 100) / 100,
                owes: Math.round(p.owes * 100) / 100,
                balance: Math.round(p.balance * 100) / 100,
                categories: p.categories
            };
        });

        return {
            categories: categoryDetails,
            persons: personDetails,
            couples: coupleDetails,
            entityBalances: entityBalances,
            transfers: transfers,
            totalEvent: Math.round(
                Object.values(this.categories)
                    .reduce((sum, c) => sum + c.total, 0) * 100
            ) / 100
        };
    }

    _minimizeTransfers(balances) {
        const debtors = [];
        const creditors = [];

        Object.entries(balances).forEach(([entity, bal]) => {
            const rounded = Math.round(bal * 100) / 100;
            if (rounded < -0.01) {
                debtors.push({ name: entity, amount: -rounded });
            } else if (rounded > 0.01) {
                creditors.push({ name: entity, amount: rounded });
            }
        });

        // Sort largest first
        debtors.sort((a, b) => b.amount - a.amount);
        creditors.sort((a, b) => b.amount - a.amount);

        const transfers = [];

        while (debtors.length > 0 && creditors.length > 0) {
            const debtor = debtors[0];
            const creditor = creditors[0];

            const amount = Math.min(debtor.amount, creditor.amount);
            const rounded = Math.round(amount * 100) / 100;

            if (rounded > 0.01) {
                transfers.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: rounded
                });
            }

            debtor.amount = Math.round((debtor.amount - amount) * 100) / 100;
            creditor.amount = Math.round((creditor.amount - amount) * 100) / 100;

            if (debtor.amount < 0.01) debtors.shift();
            if (creditor.amount < 0.01) creditors.shift();
        }

        return transfers;
    }
}