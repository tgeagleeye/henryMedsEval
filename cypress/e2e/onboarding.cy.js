import * as onboarding from '../support/functions/onboarding'
describe('Onboarding Flow', () => {
  beforeEach(() => {
    cy.visit('https://onboard-dev.henrymeds.com/')
  })

  it('Allows a client to fill out a form requesting information about when their particular state will be eligible', () => {
    onboarding.clickStateButtonByName('Other State')
    onboarding.typeIntoStateInput('Minnesota')
    onboarding.fillOutUnsupportedStateForm('first', 'last', '801-555-5555', 'email@email.com') 
    //When manually editing the phone number, I found that instead of allowing me to replace the numbers I've highlighted after the first character was typed, 
    //it took me to the end of the input instead of saving my index location
    onboarding.assertThankYouPageIsDisplayed()
  })

  it('returns with a valid Provider name when choosing a time', () => {
    //Given more time, I would like to have written functionality that would choose a different state if the page reached indicated no available times
    //either by (preferably) dynamic usage of the api or by brute force
    onboarding.clickStateButtonByName("Colorado")
    onboarding.clickTimeButtonByTime()
    onboarding.clickContinueButton()
    onboarding.fillOutContactDetailsForm('first', 'last', 'email@email.com', '01/01/1980', '555-555-5555', 'M', 'he/him')
    onboarding.fillOutShippingForm('1234 Road Rd.', '', 'Colorado City', '55803')
    onboarding.assertClientHasReachedThePaymentPage()
  })

  it('displays a message that there are no available appointment times', () => {
    onboarding.setApiToReturnNoAvailableTimes()
    onboarding.clickStateButtonByName("Colorado")
    onboarding.assertNoAvailabilities()
  })
})

describe('Available Appointment Times API', () => {
  it('returns a list of available times', () => {
    const header = {
      'content-type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
    }
    const query = `query cappedAvailableTimes($state: String!, $treatmentShortId: String!, $minimumDate: timestamptz!, $maximumDate: timestamptz!) {
      cappedAvailableTimes: appointment_capped_available_appointment_slots(
        where: {start_time: {_gt: $minimumDate, _lt: $maximumDate}, state: {_eq: $state}, treatment_object: {short_id: {_eq: $treatmentShortId}}, language: {_eq: "en-US"}, provider: {_and: {id: {_is_null: false}}}}
        order_by: {start_time: asc}
      ) {
        ...CappedAvailableSlotsFragment
        __typename
      }
    }
    
    fragment CappedAvailableSlotsFragment on appointment_capped_available_appointment_slots {
      startTime: start_time
      endTime: end_time
      provider {
        id
        displayName: display_name
        __typename
      }
      __typename
    }`
    const variables = {
      "minimumDate": "2023-09-24T02:41:14.375Z",
      "maximumDate": "2023-10-05T02:41:14.375Z",
      "state": "colorado",
      "treatmentShortId": "weightloss"
    }
    
    cy.request({
      method: 'POST',
      headers: header,
      url: 'https://henry-dev.hasura.app/v1/graphql',
      body: {query: JSON.parse(JSON.stringify(query)), variables },
      timeout: 20000,
    }).then((res) => {
      expect(res.body.data.cappedAvailableTimes).to.not.be.empty
    })
  })
})

