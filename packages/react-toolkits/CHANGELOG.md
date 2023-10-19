# react-toolkits

## 0.3.24

### Patch Changes

- 34b3bd1: fix: game should not to be null
- 55755e5: refactor: remove useQueryListMutate hook

## 0.3.23

### Patch Changes

- a0fa291: feat: set game to null while current game is not exsiting in options

## 0.3.22

### Patch Changes

- cf4e541: feat: preseve data when mutating

## 0.3.21

### Patch Changes

- 6d92622: refactor: rename ContextProvider api
- 639b0db: refactor: use new swr key in QueryList component
- c3d640b: feat: merge queries in url and params
- 639b0db: refactor: new QueryList swr key
- d26afc9: refactor: change game change callback

## 0.3.20

### Patch Changes

- a90e311: refactor: change RequireGame display

## 0.3.19

### Patch Changes

- c67ef05: fix: RequireGame copywrite is wrong
- 63a76e3: feat: change request options

## 0.3.18

### Patch Changes

- 4751aa7: refactor: use query-string lib process query params

## 0.3.17

### Patch Changes

- 2e4a969: chore: rollback

## 0.3.16

### Patch Changes

- 1b77aa0: chore: rollback

## 0.3.15

### Patch Changes

- 217fae8: refactor: react-toolkits QueryList

## 0.3.14

### Patch Changes

- 7f1c9b7: feat: set timer to 0 ms

## 0.3.13

### Patch Changes

- a2d2e19: feat: export enum QueryListAction

## 0.3.12

### Patch Changes

- ec2fb3c: feat: set isGlobalNS to true

## 0.3.11

### Patch Changes

- b9b1ce0: feat: remove isGlobalNS prop

## 0.3.10

### Patch Changes

- 4d657eb: feat: clear cache

## 0.3.9

### Patch Changes

- 5432d5b: feat(alpha): reload page after switching game

## 0.3.8

### Patch Changes

- a320abc: fix: app-id header not right in request function

## 0.3.7

### Patch Changes

- 9712dc2: fix: useValidateToken hook 404

## 0.3.6

### Patch Changes

- 36adce8: feat: pass formInstance to child

## 0.3.5

### Patch Changes

- a745421: feat: clear swr cache when switching game

## 0.3.4

### Patch Changes

- 3982f5e: feat: add localeDropdownMenu option

## 0.3.3

### Patch Changes

- ce87e84: feat: add translations

## 0.3.2

### Patch Changes

- 860eeec: feat: support i18n
- 3dbfca6: refactor: combine useQueryListJump and useQueryListMutate into useQueryListMutate

## 0.3.1

### Patch Changes

- 6ff6463: feat: add extras for FilterFormWrapper

## 0.3.0

### Minor Changes

- fbd5680: feat: return some original data in reponse of request function

## 0.2.29

### Patch Changes

- 4040d6a: feat: add 'responseType' in request function

## 0.2.28

### Patch Changes

- 2e04198: fix: dead loop for token validation

## 0.2.27

### Patch Changes

- 9df4527: feat: remove suspense in usePermissions hook

## 0.2.26

### Patch Changes

- 38077e9: feat: delay token validation request

## 0.2.25

### Patch Changes

- 3f68ddd: feat: check if token is valid

## 0.2.24

### Patch Changes

- 32cbf9d: fix: toolkitContextStore is not synchronized

## 0.2.23

### Patch Changes

- c6825d1: fix: ContextProvider title value issue
- 99bd364: feat: cache ToolkitsContext config

## 0.2.22

### Patch Changes

- a9d0a28: feat: set default values for ContextProvider

## 0.2.21

### Patch Changes

- c6c3627: feat: add 'params' property for request function

## 0.2.20

### Patch Changes

- fceb92e: fix: missing isGlobalNS prop in ContextProvider

## 0.2.19

### Patch Changes

- db1c013: feat: hide FilterFormWrapper when renderForm is undefined

## 0.2.18

### Patch Changes

- cd0dea1: fix: missing form prop

## 0.2.17

### Patch Changes

- e49fc1c: some features of react-toolkits

## 0.2.16

### Patch Changes

- 6d43fa6: feat: change parameters type of useQueryListMutate

## 0.2.15

### Patch Changes

- 46d3223: fix: typo

## 0.2.14

### Patch Changes

- 5addd49: feat: delay QueryList init function call

## 0.2.13

### Patch Changes

- d7349bc: fix type issues

## 0.2.12

### Patch Changes

- e7ef5ff: refactor: replace useSWRMutation with useSWR in QueryList component

## 0.2.11

### Patch Changes

- 450de65: fix: perform request while form is invalid

## 0.2.10

### Patch Changes

- c449bda: refactor: new form instance

## 0.2.9

### Patch Changes

- 99c0392: feat: cache form instance

## 0.2.8

### Patch Changes

- 3aa9d03: refactor: change permision type

## 0.2.7

### Patch Changes

- 49cf639: feat: export form from useFormModal hook

## 0.2.6

### Patch Changes

- a1daf00: feat: pass formInstance from outside

## 0.2.5

### Patch Changes

- a434999: fix: export QueryListAction wrong

## 0.2.4

### Patch Changes

- 82dc6ab: feat: export QueryListAction type

## 0.2.3

### Patch Changes

- ac6526f: feat: add afterQuerySuccess hook

## 0.2.2

### Patch Changes

- 850d6ae: release react-toolkits

## 0.2.1

### Patch Changes

- ea24738: change output

## 0.2.0

### Minor Changes

- 5178751: fix: json type response wrong

## 0.1.4

### Patch Changes

- 0c9c659: return not json response

## 0.1.3

### Patch Changes

- 9323922: change QueryList types

## 0.1.2

### Patch Changes

- 771e848: set Layout content overflow to 'overlay'

## 0.1.1

### Patch Changes

- 164900b: redraw Layout children when game change

## 0.1.0

### Minor Changes

- 6ea70f7: permission module support api v2

## 0.0.8

### Patch Changes

- 955ef06: typo

## 0.0.7

### Patch Changes

- e23ffd1: rewrite perPage to size
- c782902: upgrade prettier version

## 0.0.6

### Patch Changes

- 90f2dd0: release react-toolkits

## 0.0.5

### Patch Changes

- 3c0ff88: release react-toolkits

## 0.0.4

### Patch Changes

- a32af27: fix useFormModal hook can not set initialValues

## 0.0.3

### Patch Changes

- 1d40a67: filter nav items by permission

## 0.0.2

### Patch Changes

- 732b9bd: use org flow97

## 0.0.1

### Patch Changes

- e7f10f0: release
- afa5306: release

  Please enter a summary for your changes.
