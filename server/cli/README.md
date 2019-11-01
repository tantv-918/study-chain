## 1. Enroll admin

- orgid {String} (default: student}

```bash
node enrollAdmin.js --orgMSP=[OrgName] --username=[username]
```

#### Example:

enrollAdmin Org student:

```bash
	node enrollAdmin.js --username=trinh
```

enrollAdmin Org academy:

```bash
	node enrollAdmin.js --orgMSP=academy --username=tan
```

## 2. Register user

- orgid {String} (default: student}
- userid {String} (required)

```bash
	node registerUser.js --username=[username] --orgMSP=[OrgName] --fullname=[Fullname]
```

#### Example:

Register 20156425 in studen (student):

```bash
	node registerUser.js --username=20156425 --orgMSP=student --fullname=TrinhVanTan --password=123456
```

Register GV00 in academy (teacher):

```bash
	node registerUser.js --username=GV00 --orgMSP=academy --fullname=ABC --password=123456
```

## Enroll admin and register user with `intit.sh`

```bash
chmod +x ./init.sh
./init.sh
```

## Query Ledger

- orgid {String} (default: student)
- func {String} Function Name (required)
- userid {String} (required)
- args {String} argument of function (optional)

```bash
	node query.js --userid=[UserId] --org=[OrgName] --func=[FunctionName] --args=[Argument]
```

#### Example:

Query student id is 1 with role academy admin:

```bash
	node query.js --username=admin --orgMSP=academy --func=QueryStudent --args=1
```

Query All student with role academy admin:

```bash
	node query.js --username=tan --func=GetAllStudents
```

Query Score with role admin student with studentId and subjectId

```bash
	// arguments = [StudentId, SubjectId]
	node query.js --username=trinh --orgMSP=student --func=QueryScore --args=10 --args=160212
```

## Invoke Ledger

- orgMSP {String} (default: student)
- func {String} Function Name (required)
- username {String} (required)
- argument {String} (optional: depend of function call)

#### Example:

```bash
	node invoke.js --username=tan --func=CreateCertificate --student=1
```

```bash
node invoke.js --userid=admin --orgid=student --func=CreateStudent --studentid=1 --studentname=cong
```
