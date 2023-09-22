export function clickStateButtonByName(state) {
    if (state) {
        cy.get('.MuiButton-root').filter(`:contains('${state}')`).click({ force: true })
    } else {
        cy.get('.MuiButton-root').first().click({ force: true })
    }
}

export function clickTimeButtonByTime(time) {
    if (time) {
        cy.get('.MuiButton-root').filter(`:contains('${time}')`).first().click({ force: true })
    } else {
        cy.get('.MuiButton-root').first().click({ force: true })
    }
}

export function clickContinueButton() {
    cy.get(".MuiButton-root").filter(':contains("Continue")').click({ force: true })
}

export function typeIntoStateInput(state) {
    const sentState = { state: state }
    cy.origin('https://ft4aaz62fi7.typeform.com', { args: sentState }, ({ state }) => {
        cy.get('[data-qa="question-wrapper"]').first().within(() => {
            cy.get('input[class*="InputField"]').type(state)
            cy.get('mark').filter(`:contains(${state})`).click({ force: true })
        })
    })
}

export function fillOutContactDetailsForm(firstName, lastName, email, dateOfBirth, phone, sex, pronouns) {
    cy.get('.MuiInputBase-input[name="firstName"]').type(firstName)
    cy.get('.MuiInputBase-input[name="lastName"]').type(lastName)
    cy.get('.MuiInputBase-input[name="email"]').type(email)
    cy.get('.MuiInputBase-input[name="dob"]').type(dateOfBirth)
    cy.get('.MuiInputBase-input[name="phone"]').type(phone)
    cy.get('select.MuiNativeSelect-select').eq(0).select(sex)
    cy.get('select.MuiNativeSelect-select').eq(1).select(pronouns)
    clickContinueButton()
}

export function fillOutShippingForm(address1, address2, city, zip) {
    cy.get('input[name="addressLine1"]').type(address1)
    if (address2) {
        cy.get('input[name="addressLine2"]').type(address2)
    }
    cy.get('input[name="city"]').type(city)
    cy.get('input[name="zip"]').type(zip)
    clickContinueButton()
    //If given more time I would've created additional logic to handle the additional form inputs if billing was different from shipping
}

export function fillOutUnsupportedStateForm(firstName, lastName, phone, email) {
    const sentArgs = { firstName, lastName, phone, email }
    cy.origin('https://ft4aaz62fi7.typeform.com', { args: sentArgs }, ({ firstName, lastName, phone, email }) => {
        cy.get('input[name="given-name"]').type(firstName)
        cy.get('input[name="family-name"]').type(lastName)
        cy.get('input[name="tel"]').type(phone)
        cy.get('input[name="email"]').type(email)
        cy.get('[data-qa*="submit-button"]').click({ force: true })
    })
}

export function setApiToReturnNoAvailableTimes() {
    cy.intercept('POST', 'https://henry-dev.hasura.app/v1/graphql', (req) => {
      if (hasOperationName(req, 'cappedAvailableTimes')) {
        req.alias = 'gqlcappedAvailableTimesQuery'

        req.reply((res) => {
            res.body.data.cappedAvailableTimes = []
        })
      }
    })
}

export const hasOperationName = (req, operationName) => {
    const { body } = req
    return (
      body.hasOwnProperty('operationName') && body.operationName === operationName
    )
  }

export function assertClientHasReachedThePaymentPage() {
    cy.get('h3').should('contain.text', 'Payment Method')
}

export function assertThankYouPageIsDisplayed() {
    cy.origin('https://ft4aaz62fi7.typeform.com', () => {
        cy.get('h1').should('contain.text', 'Thank you!')
    })
}

export function assertNoAvailabilities() {
    cy.get('.MuiTypography-gutterBottom').should('contain.text', 'Sorry! We currently have no availabilities for Colorado')
}