// Parse terms from Quizlets API and return data
// @param data: raw JSON from Quizlets API
// @return: parsed data
function fetchTerms(data) {
	let terms = {}

	// parse from Quizlet's API
	data.responses[0].models.studiableItem.forEach(function(e) {
		terms[e.cardSides[1].media[0].plainText.replace("\n", "")] = e.cardSides[0].media[0].plainText.replace("\n", "")
	})

	return terms
}

// Get button with the correct answer
// @param target: target is the answer to the question in plaintext
// @return: the button ELEMENT (will be clicked in main)
function getCorrectElement(target) {
	let currentTerms = document.getElementsByClassName("FormattedText notranslate FormattedTextWithImage-wrapper")
	for (let i=0; i<currentTerms.length; i++) {
		if (currentTerms[i].textContent.replace("\n", "") == target) {
			return currentTerms[i]
		}
	}
}

// Locate buttons which make up the target word/phrase
// @param buttons: list of buttons avaliable
// @param target: the correct answer
// @return returns the <span> element which is the buttons parent (will be parsed in main)
function locateButtons(buttons, target) {
	let targetButtons = []
	for (let j=0; j<target.length; j++) {
		for (let i=0; i<buttons.length; i++) {
			if (buttons[i].textContent == target[j]) {
				targetButtons.push(buttons[i])
			}
		}
	}
	return targetButtons
}

const id = window.location.href.split("/")[3]
var cardData = await fetch(`https://quizlet.com/webapi/3.4/studiable-item-documents?filters%5BstudiableContainerId%5D=${id}&filters%5BstudiableContainerType%5D=1&perPage=1000&page=1`).then(res => res.json())
const terms = fetchTerms(cardData)

while (1) {
	try {
		const question = document.getElementsByClassName("FormattedText notranslate FormattedTextWithImage-wrapper")[0].textContent
		console.log(question, terms[question])
		try {
			// multiple choice
			getCorrectElement(terms[question]).click()
		} catch (TypeError) {
			// type
			// Weird error where quizlet doesn't just allow you to input something
			// const input = document.getElementsByClassName("AssemblyInput-input AssemblyInput-placeholder")[0]
			// input.value = terms[question].split("/")[0]

			// locate all buttons instead of replacing .value
			const buttons = document.getElementsByClassName("bmm43df")
			const selectButtonOrder = locateButtons(buttons, terms[question].split("/")[0])

			selectButtonOrder.forEach(function(e) {
				e.children[0].click()
			})

			document.getElementsByClassName("AssemblyButtonBase AssemblyPrimaryButton--default AssemblyButtonBase--medium AssemblyButtonBase--padding")[0].click()
		}
	} catch (TypeError) {
		// Quizlet showing the next screen
		const nextButton = document.getElementsByClassName("AssemblyButtonBase AssemblyPrimaryButton--default AssemblyButtonBase--large AssemblyButtonBase--padding")[0]
		nextButton.click()
	}
	await new Promise(r => setTimeout(r, 1500))
}
