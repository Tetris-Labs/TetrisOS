// UUIDs are stable identifiers. NEVER change these after v0.0.1 is deployed —
// Twenty treats changed UUIDs as new entities and orphans existing records.

// App + role
export const ATS_APP_ID = '12090ba2-9689-4d84-9fee-a500765478a0';
export const ATS_RECRUITER_ROLE_ID = 'b05643f0-8ec7-4631-bb96-217d3c76eb94';

// Objects
export const POSITION_OBJECT_ID = 'ac55eaf8-5431-4150-ab7d-c119a78b260b';
export const APPLICATION_OBJECT_ID = '0c3edabe-18ac-4d1c-8bd2-81fdb28f3940';

// Position scalar fields
export const POSITION_NAME_FIELD_ID = 'e87867ce-3a80-47f8-a09b-a83d0da2cf3c';
export const POSITION_DEPARTMENT_FIELD_ID = '9ddf63d7-82e3-458e-833a-dcfef9ee47e8';
export const POSITION_LOCATION_FIELD_ID = '5a7ca194-d713-41c1-95a7-50deb90e16dd';
export const POSITION_EMPLOYMENT_TYPE_FIELD_ID = 'b098a0b0-1597-4735-b5dc-daf828bf22bc';
export const POSITION_DESCRIPTION_FIELD_ID = 'e9d9cb18-7e7c-4c85-aec2-54422a7f4b1c';
export const POSITION_STATUS_FIELD_ID = '7e2ac4fb-3557-4e0b-bc67-b1452a8d293f';
export const POSITION_OPENED_AT_FIELD_ID = '9f311780-e625-43e1-8099-a76274d3ea36';
export const POSITION_CLOSED_AT_FIELD_ID = '85044734-b68d-40ba-a2a3-02c899db7c03';
export const POSITION_SCORING_FRAMEWORK_FIELD_ID = 'c26b4bde-e0db-4637-80c8-8a1177ae0e84';
// Twenty auto-creates createdAt on every object with this deterministic v5 UUID
export const POSITION_CREATED_AT_FIELD_ID = '52dfe553-9450-572e-bc23-aee993a2f518';

// Application scalar fields
export const APPLICATION_DISPLAY_LABEL_FIELD_ID = '2ef00522-3b16-4260-84fe-0446be392460';
export const APPLICATION_STAGE_FIELD_ID = 'b11eaa60-a316-4837-a60c-5b0e89b94d56';
export const APPLICATION_SOURCE_FIELD_ID = '1fddf286-8e03-4666-91bc-9ef6c2bab78f';
export const APPLICATION_APPLIED_AT_FIELD_ID = 'ecb3cb4f-068c-4296-9609-505655604225';
export const APPLICATION_RATING_FIELD_ID = 'fc05f772-b8c5-4be9-8ad5-bbe6d10a4eb4';
export const APPLICATION_DISQUALIFY_REASON_FIELD_ID = '0d9325b0-2089-411a-b2bb-30b23a402ff9';
export const APPLICATION_NOTES_FIELD_ID = '6890d61a-130b-498a-b4de-2d7f6386e66c';
export const APPLICATION_FIT_SCORE_FIELD_ID = '6105b3a1-2d76-47c3-944f-58fed8c8aaf4';
export const APPLICATION_REASONING_FIT_SCORE_FIELD_ID = '8a3543a7-3492-4d60-bcba-4dc34024d568';
export const APPLICATION_FIT_SCORE_GENERATED_FIELD_ID = '35a9a7cc-ced9-41ba-82fe-4b0865e3d243';

// Relation fields
export const APPLICATION_CANDIDATE_FIELD_ID = '4a138ed4-ce57-4c23-b049-2dad1d52f63f';
export const PERSON_APPLICATIONS_FIELD_ID = 'c16d44d4-5b73-418b-b309-5d5c62f1586b';
export const APPLICATION_POSITION_FIELD_ID = 'aeef516e-82de-478b-a91d-4fc6ca47123a';
export const POSITION_APPLICATIONS_FIELD_ID = 'ab0d2d96-ecfc-4651-96e5-2474569680dd';
export const POSITION_HIRING_MANAGER_FIELD_ID = 'e549cc07-701f-4032-acbd-d87c87f04319';
export const WORKSPACE_MEMBER_POSITIONS_HIRING_FIELD_ID = '723f8606-91d9-4e8b-a704-6badddf3febd';

// Logic function
export const SET_DISPLAY_LABEL_FUNCTION_ID = '337269e3-0455-40f1-9674-73c097bd9c11';

// Stage SELECT option UUIDs (position drives kanban column order, left to right).
// TAGGED_INTERESTED reuses the old STAGE_ACTIVE UUID; REJECTED_PULLED reuses the
// old DISQUALIFIED UUID to keep stable IDs across the stage restructure.
export const STAGE_TAGGED_INTERESTED_ID = '7397eb06-1bb8-44af-8ec6-2dab1749f9ea';
export const STAGE_QUALIFYING_ID = '034aff34-da66-406a-a521-abd70b477437';
export const STAGE_SCHEDULE_ID = 'ffef41dc-19ea-4ba5-a5a0-fd6488b6f89a';
export const STAGE_SUBMITTED_ID = '76a3c775-0414-4174-8676-3ddaba50034a';
export const STAGE_PHONE_SCREEN_ID = '66275922-23eb-47df-a847-5b419a01ce54';
export const STAGE_SECOND_INTERVIEW_ID = '0f21f42f-fdbd-40d9-8308-0d472c2b66d3';
export const STAGE_THIRD_INTERVIEW_ID = '2fe60018-692a-497c-9035-357b6b79402f';
export const STAGE_FINAL_ID = 'b0ddde6c-3a2e-4ffa-9f84-dfe4f8fd0a42';
export const STAGE_OFFER_ID = '22a960ac-3a9a-4b09-ad01-382dffbaf29b';
export const STAGE_REJECTED_PULLED_ID = 'ccfc5c84-f68a-4f3b-b071-b3f84da9b9f0';

// Source SELECT option UUIDs (on Application)
export const SOURCE_REFERRAL_ID = '0485d0c3-9aef-449f-a1a7-a8ea0503b9fa';
export const SOURCE_SOURCED_ID = 'fb36c76e-b1d7-461d-b2c7-1e0b814527bd';
export const SOURCE_CAREER_PAGE_ID = 'aa78d095-89db-41bf-bffe-b93881fc7f62';
export const SOURCE_INBOUND_ID = 'ac8bdbe8-4b07-4ae4-afad-0a2b7d3f73ce';
export const SOURCE_OTHER_ID = '5e70ef21-c73f-41c7-9efc-fd87fba8d7af';

// Rating SELECT option UUIDs (on Application)
export const RATING_STRONG_YES_ID = '332aa327-9bbb-468a-b875-8aaa031577d0';
export const RATING_YES_ID = '0f5c3256-fec3-445b-93ba-5acd7a8f299c';
export const RATING_NO_ID = 'c33d83c8-d1e2-446e-bae8-fe22b7c22950';
export const RATING_STRONG_NO_ID = 'b80bd9a6-5bbe-4811-bf66-332af62186f5';

// Disqualify reason SELECT option UUIDs (on Application)
export const DISQUALIFY_SKILLS_MISMATCH_ID = 'ec647450-5f6e-47b5-b44a-1d4940022777';
export const DISQUALIFY_CULTURE_MISMATCH_ID = 'a08df864-d543-4abb-a3c1-313890225ac9';
export const DISQUALIFY_COMPENSATION_ID = '23627433-1d47-46f0-a50d-2f147602de2a';
export const DISQUALIFY_WITHDREW_ID = '483bbbc4-ff3c-4ee1-af41-f6e586de6b26';
export const DISQUALIFY_OTHER_ID = '1bb00ffd-c84c-41d6-8ec6-cf842708db96';

// Department SELECT option UUIDs (on Position)
export const DEPT_ENGINEERING_ID = 'a489a1fa-090e-4c03-b44d-6c36e6a8e765';
export const DEPT_DESIGN_ID = 'e33c3daa-4989-4426-a805-6d4958b42f39';
export const DEPT_PRODUCT_ID = '576a6691-7400-4d79-9f75-dadd473d10d7';
export const DEPT_GTM_ID = '9d818e68-06c7-4f46-bc6b-3bfad5f2f2b4';
export const DEPT_OPS_ID = '1a1c7dda-e1ba-49d7-b2af-b0876bb4e2c3';
export const DEPT_OTHER_ID = '30d7ced2-72fc-4dfd-9c52-a93cd3b5dc0b';

// Employment type SELECT option UUIDs (on Position)
export const EMPLOYMENT_FULL_TIME_ID = '873d312b-b36c-4fea-9bb9-f22e963b9e46';
export const EMPLOYMENT_PART_TIME_ID = '28539efd-cb06-4115-98ee-23c2feac3fef';
export const EMPLOYMENT_CONTRACT_ID = 'e4bd2415-7444-43af-bb3f-4a8bcb563500';
export const EMPLOYMENT_INTERNSHIP_ID = '5a1167fd-2044-4d12-ab72-8b1df5fecbd9';

// Position status SELECT option UUIDs
export const POSITION_STATUS_DRAFT_ID = '1bd447eb-cd39-4a24-84cc-a08298cbd99e';
export const POSITION_STATUS_OPEN_ID = '63c71fbe-15ce-4572-a188-bb5380a4dec0';
export const POSITION_STATUS_ON_HOLD_ID = '3bfbdf04-1c7b-49bb-9b4b-57591a7e7fc3';
export const POSITION_STATUS_CLOSED_ID = 'bd432ffd-fed2-47f1-bc66-0cc9bed66aac';

// Views
export const VIEW_POSITIONS_ALL_ID = 'f7302b1c-3c25-43d8-88fd-21c79e49f53f';
export const VIEW_POSITIONS_BY_DEPT_ID = 'e8be447f-b134-4263-a2cd-7be3d3982cf7';
export const VIEW_APPLICATIONS_PIPELINE_ID = '86cde14a-b30d-4699-a82a-d1c1c041391e';
export const VIEW_APPLICATIONS_ACTIVE_ID = '125931c0-77c2-4176-899f-fa5ff1643fb4';
export const VIEW_APPLICATIONS_ALL_ID = '215ccf8e-f06c-4910-8445-31195d6f8442';

// Navigation menu items
export const NAV_POSITIONS_ID = 'f681720b-1d41-447b-a0ea-ead052b86f7b';
export const NAV_PIPELINE_ID = '1a0e7790-4867-4da9-858a-7c658961ce7c';
export const NAV_ACTIVE_ID = '5df63901-862b-42f3-8f60-571e1f50b964';

// View-field UUIDs — each visible field on each view needs its own ID
// Positions All table
export const VF_POSITIONS_ALL_NAME = '63ef4479-09f4-4748-a447-a0673a64d16a';
export const VF_POSITIONS_ALL_DEPT = '7ac2b70b-775d-45b8-903d-33ed33a9ec89';
export const VF_POSITIONS_ALL_LOCATION = 'd32d3e97-8d0f-4512-99ad-2803bbdd2988';
export const VF_POSITIONS_ALL_EMPLOYMENT = 'a5f9c3b7-1579-4b49-bd79-cbce992d4fb7';
export const VF_POSITIONS_ALL_STATUS = '3b8c9f65-6fe3-48fd-8a86-e9ee55debeb8';
export const VF_POSITIONS_ALL_HIRING_MGR = 'a4cb9272-daec-4ff7-b7f3-3e40cb1351de';
export const VF_POSITIONS_ALL_OPENED_AT = '4058cb0d-0a7a-4f4d-9fd3-b0ef63c97593';

// Applications Pipeline kanban
export const VF_PIPELINE_LABEL = '51070185-9ac4-451c-90c2-518235cb61d3';
export const VF_PIPELINE_POSITION = '52042cb4-f561-4ada-85ff-1eb4058a79ac';
export const VF_PIPELINE_RATING = '45db2d84-0128-4b01-b9ba-347b053ed348';
export const VF_PIPELINE_APPLIED_AT = '24fbe4d4-4c4e-4045-865e-49bc5b6697df';

// Applications Active table
export const VF_ACTIVE_LABEL = '0593c653-e236-4edb-8ca5-0cd453ef4e0f';
export const VF_ACTIVE_POSITION = 'bcaf1ac3-c511-4863-b917-3c662e9a0bca';
export const VF_ACTIVE_CANDIDATE = 'e03bffd4-8c6a-40e5-9069-7fe6448056a6';
export const VF_ACTIVE_STAGE = '5afda98e-3f03-48ec-87d8-8ff4b6db7cdb';
export const VF_ACTIVE_RATING = 'a75a7ef5-a409-462e-8ed9-75ce37a93326';
export const VF_ACTIVE_APPLIED_AT = '42d97392-f797-4571-bb05-28b9b1b2aa57';
export const VF_ACTIVE_SOURCE = '3ca45eeb-14a7-4650-abee-575573f089eb';

// Filter UUIDs
export const FILTER_ACTIVE_STAGE_ID = '7226dcfb-e4a4-4b21-9e43-67666e3876d1';

// Record-page FIELDS_WIDGET views — these power the record detail page,
// separate from the table/INDEX view. Without these, custom objects' record
// pages hide most fields including relations.
export const VIEW_APPLICATION_RECORD_PAGE_ID = '5e87dccf-b211-4730-a60a-e2aa5520a988';
export const VIEW_POSITION_RECORD_PAGE_ID = '48b0335c-dd86-4ebe-94a2-be56d3e3c712';

// View-field UUIDs for application record page
export const VF_APP_PAGE_LABEL = '1acbd9da-4ff5-4a15-99b0-35d97858a640';
export const VF_APP_PAGE_CANDIDATE = 'cbd9f61a-c141-46be-b8d3-c4e853a15cec';
export const VF_APP_PAGE_POSITION = '5fbdc18f-28cc-4383-a32a-b58dda13b476';
export const VF_APP_PAGE_STAGE = '979f347c-d48c-4cbc-b7f9-d2f3a50be619';
export const VF_APP_PAGE_RATING = '5c83ed45-48a6-4125-9089-ac5b43445ab2';
export const VF_APP_PAGE_SOURCE = '7739a531-76a3-43c6-a9f9-1f676714faac';
export const VF_APP_PAGE_APPLIED_AT = 'e4bd894d-727f-4661-944f-b5ac6cbf87bb';
export const VF_APP_PAGE_DISQUALIFY = '88ca3e0e-ba35-4c9c-b755-3e188e834241';
export const VF_APP_PAGE_NOTES = '8180c601-7965-4cea-9b31-b848b85bf856';

// Page layouts (and their tabs/widgets) for record-detail pages
export const PAGE_LAYOUT_APPLICATION_ID = 'b6284038-348a-48bc-aead-71f7dcc9f4b7';
export const PAGE_LAYOUT_POSITION_ID = '4a12b1da-8e5c-4f3f-a727-23b82739413d';
export const TAB_APPLICATION_FIELDS_ID = '639a72ff-cc50-416f-aec6-e90a8ea77d9b';
export const TAB_POSITION_FIELDS_ID = '52a57009-7456-4cc8-a00d-5cbb1cc09c2f';
export const WIDGET_APPLICATION_FIELDS_ID = '96578e34-b3ab-47d1-b55e-39f88eec11ad';
export const WIDGET_POSITION_FIELDS_ID = '2e228cc6-d2c9-4c7b-8f43-759540e96089';

// Standard tabs + widgets per page layout (Timeline, Tasks, Notes, Files)
export const TAB_APPLICATION_TIMELINE_ID = 'aad1ee3a-d6fe-4dc1-a503-b1aa369323c3';
export const TAB_APPLICATION_TASKS_ID = 'cd88bc86-9490-48d5-af3e-5b7ddc10d7eb';
export const TAB_APPLICATION_NOTES_ID = 'f6d0c188-67a1-4c05-be02-b6e9642296d8';
export const TAB_APPLICATION_FILES_ID = 'af63fa54-2d06-4060-bb34-d54c613f34b0';
export const WIDGET_APPLICATION_TIMELINE_ID = '8d196dd2-6f47-4efd-8851-a709bfc4c0c4';
export const WIDGET_APPLICATION_TASKS_ID = '463b2d37-3af5-41bf-a0d1-c3933a056705';
export const WIDGET_APPLICATION_NOTES_ID = 'eb87930e-fba2-40ff-ab28-48e55fab4a17';
export const WIDGET_APPLICATION_FILES_ID = 'd224c399-4758-4e11-a5f2-4c297c99cff7';

export const TAB_POSITION_TIMELINE_ID = 'af0a6c98-95ce-419f-b399-aca8f4863563';
export const TAB_POSITION_TASKS_ID = 'f324c6be-bc39-426e-b07d-659bf6420408';
export const TAB_POSITION_NOTES_ID = '46c7052d-08d8-4059-b69e-2fb93f1bb52d';
export const TAB_POSITION_FILES_ID = 'a292cd38-fff8-4c6f-a36f-ef7dc75ab21f';
export const WIDGET_POSITION_TIMELINE_ID = 'f5b269ed-3bfd-41b8-818d-df21be7fbbe4';
export const WIDGET_POSITION_TASKS_ID = 'ccc1a15d-b4b2-4e4a-9e3a-c57175a4cdc9';
export const WIDGET_POSITION_NOTES_ID = '39598f79-0036-4b55-b554-ce276df09f13';
export const WIDGET_POSITION_FILES_ID = '262caf3a-25e5-43b7-980a-025dbacb674d';

// View-field UUIDs for position record page
export const VF_POS_PAGE_NAME = 'f9e8f8bc-1d9f-484c-a32e-c6dc142908f9';
export const VF_POS_PAGE_DEPT = 'f2b64a2e-095f-4d9a-a7d6-e520b024aad5';
export const VF_POS_PAGE_LOCATION = '1f07d624-0f64-4083-9ac2-edaab29a2c15';
export const VF_POS_PAGE_EMPLOYMENT = '35fbca1e-7c61-4345-a236-7d984a71cf26';
export const VF_POS_PAGE_STATUS = '76606c78-e28b-4319-88ac-179c2a500e44';
export const VF_POS_PAGE_HIRING_MGR = 'c8893d43-73e8-4732-8429-d37309832215';
export const VF_POS_PAGE_OPENED_AT = '56645b91-19f0-4798-bf7b-fd9dd640831d';
export const VF_POS_PAGE_DESCRIPTION = '74e8ccd4-db72-4403-99f0-d15be698f573';
export const VF_POS_PAGE_CLOSED_AT = '75db2827-eee0-4125-9d85-64f97110cb70';
export const VF_POS_PAGE_SCORING_FRAMEWORK = '5b72a1a2-c98d-4c06-81e9-c4857bd5e8b1';

// Applications All kanban viewGroup UUIDs (one per stage option, position drives column order)
export const VG_ALL_TAGGED_INTERESTED = 'b867553b-5ea2-4244-883e-b396101b090b';
export const VG_ALL_QUALIFYING = 'de1d997a-fd6c-40fc-b2db-a93ea50c9220';
export const VG_ALL_SCHEDULE = '0dfd1fba-0296-40f8-a507-18393c920932';
export const VG_ALL_SUBMITTED = 'bf1aa680-cc3c-4bd8-a716-64fa9327887a';
export const VG_ALL_PHONE_SCREEN = '5645381b-c406-4615-b6af-1fd5393333fb';
export const VG_ALL_SECOND_INTERVIEW = 'c6ccc232-d73a-4c44-a122-e348f564d04a';
export const VG_ALL_THIRD_INTERVIEW = '106a0d68-ea3d-4378-9309-e603cc8f4fc3';
export const VG_ALL_FINAL = 'c06d1e80-f6bc-4697-995b-ca072fa0a10d';
export const VG_ALL_OFFER = 'fd7d9c30-3316-4e45-a230-e5ca9ce6b25d';
export const VG_ALL_REJECTED_PULLED = 'b6ba6c99-4472-42b2-956b-f84e28c020e1';

// Applications All table
export const VF_ALL_LABEL = '81008a49-7ad5-4462-87c9-26f6f556ed1c';
export const VF_ALL_POSITION = 'b6087ec3-822e-4d66-86b2-b6edea49155c';
export const VF_ALL_CANDIDATE = 'ea5f711e-2f6e-4480-a780-4e4dbceb15e4';
export const VF_ALL_STAGE = 'ff9af2fb-5dfa-49f9-a4ff-758a496051c9';
export const VF_ALL_RATING = 'a63b8de0-a7b0-4969-be54-fa245575fbaa';
export const VF_ALL_APPLIED_AT = '5bbef0ce-f864-40b4-b3cc-3fc56a68ba49';
export const VF_ALL_SOURCE = '682fcd96-ace6-4ebb-8066-74cec9a63bc4';
export const VF_ALL_NOTES = '60ebe3da-87fd-4abe-9927-8d19b963d7ab';
export const VF_ALL_FIT_SCORE = 'a83cf514-61cf-48df-a6f7-aa9660383457';
export const VF_ALL_FIT_SCORE_GENERATED = '0d29b94c-be90-49be-8f4e-5bb109fa0248';
export const VF_ALL_REASONING_FIT_SCORE = '87287d23-ba0a-4aa3-9ba3-48ce995146f8';

// Positions All table (additional)
export const VF_POSITIONS_ALL_DESCRIPTION = '488c7a59-f38a-42cf-a380-3865d807d7dd';
export const VF_POSITIONS_ALL_CREATED_AT = '5e245cab-e1b4-4c80-96b1-22eca0512915';
export const VF_POSITIONS_ALL_SCORING_FRAMEWORK = '3a6bb093-5861-4eeb-b349-9dcb94b4f155';
